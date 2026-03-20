from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
import io
from typing import List
import os
import tempfile
from PIL import Image
import img2pdf
import fitz
from pdf2docx import Converter

# Platform-specific Synthesis Engines
WIN32_AVAILABLE = False
try:
    if os.name == 'nt':
        import pythoncom
        import win32com.client
        WIN32_AVAILABLE = True
except ImportError:
    pass

app = FastAPI(title="AllInOne Tool Finder API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "online", 
        "engine": "Windows Core" if WIN32_AVAILABLE else "Linux Synthesis",
        "message": "AllInOne Hub API is active."
    }

@app.post("/merge-csv")
async def merge_csv_files(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    dataframes = []
    for file in files:
        if not file.filename.endswith('.csv'): continue 
        try:
            content = await file.read()
            df = pd.read_csv(io.BytesIO(content))
            dataframes.append(df)
        except Exception as e:
            print(f"Error processing {file.filename}: {e}")
            continue

    if not dataframes:
        raise HTTPException(status_code=400, detail="No valid CSV files found")

    try:
        merged_df = pd.concat(dataframes, ignore_index=True)
        output = io.StringIO()
        merged_df.to_csv(output, index=False)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=merged_dataset.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Merge failed: {str(e)}")

@app.post("/pdf-to-doc")
async def pdf_to_doc_endpoint(file: UploadFile = File(...)):
    pdf_path = None
    doc_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
            content = await file.read()
            tmp_pdf.write(content)
            pdf_path = tmp_pdf.name
        
        doc_path = pdf_path.replace(".pdf", ".docx")
        cv = Converter(pdf_path)
        cv.convert(doc_path, start=0, end=None)
        cv.close()
        
        with open(doc_path, "rb") as f:
            return StreamingResponse(
                io.BytesIO(f.read()),
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": f"attachment; filename={file.filename.replace('.pdf', '.docx')}"}
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF to Word failed: {str(e)}")
    finally:
        clean_tmp(pdf_path, doc_path)

@app.post("/doc-to-pdf")
async def doc_to_pdf_endpoint(file: UploadFile = File(...)):
    if not WIN32_AVAILABLE:
        raise HTTPException(status_code=501, detail="Microsoft Word Engine requires Windows Environment.")
    
    pythoncom.CoInitialize()
    word = None
    doc = None
    doc_path = None
    pdf_path = None
    try:
        ext = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_doc:
            content = await file.read()
            tmp_doc.write(content)
            doc_path = tmp_doc.name
        
        pdf_path = doc_path + ".pdf"
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False
        doc = word.Documents.Open(doc_path)
        doc.SaveAs(pdf_path, FileFormat=17) # 17 = wdFormatPDF
        doc.Close()
        word.Quit()
        
        with open(pdf_path, "rb") as f:
            return StreamingResponse(
                io.BytesIO(f.read()),
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={os.path.splitext(file.filename)[0]}.pdf"}
            )
    except Exception as e:
        if word: word.Quit()
        raise HTTPException(status_code=500, detail=f"Word to PDF failed: {str(e)}")
    finally:
        pythoncom.CoUninitialize()
        clean_tmp(doc_path, pdf_path)

@app.post("/doc-to-image")
async def doc_to_image_endpoint(file: UploadFile = File(...)):
    if not WIN32_AVAILABLE:
        raise HTTPException(status_code=501, detail="Microsoft Word Engine requires Windows Environment.")
    
    pythoncom.CoInitialize()
    word = None
    doc = None
    doc_path = None
    pdf_path = None
    try:
        ext = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_doc:
            content = await file.read()
            tmp_doc.write(content)
            doc_path = tmp_doc.name
        
        pdf_path = doc_path + ".pdf"
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False
        doc = word.Documents.Open(doc_path)
        doc.SaveAs(pdf_path, FileFormat=17) # 17 = wdFormatPDF
        doc.Close()
        word.Quit()
        
        # Now convert PDF to Image
        pdf_doc = fitz.open(pdf_path)
        pix = pdf_doc.load_page(0).get_pixmap()
        img_data = pix.tobytes("jpg")
        pdf_doc.close()
        
        return StreamingResponse(
            io.BytesIO(img_data),
            media_type="image/jpeg",
            headers={"Content-Disposition": f"attachment; filename={os.path.splitext(file.filename)[0]}.jpg"}
        )
    except Exception as e:
        if word: word.Quit()
        raise HTTPException(status_code=500, detail=f"Word to Image failed: {str(e)}")
    finally:
        pythoncom.CoUninitialize()
        clean_tmp(doc_path, pdf_path)

@app.post("/image-to-pdf")
async def image_to_pdf_endpoint(file: UploadFile = File(...)):
    try:
        content = await file.read()
        pdf_bytes = img2pdf.convert(content)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={os.path.splitext(file.filename)[0]}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image to PDF failed: {str(e)}")

@app.post("/pdf-to-image")
async def pdf_to_image_endpoint(file: UploadFile = File(...)):
    pdf_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
            tmp_pdf.write(await file.read())
            pdf_path = tmp_pdf.name
        
        doc = fitz.open(pdf_path)
        pix = doc.load_page(0).get_pixmap()
        img_data = pix.tobytes("jpg")
        doc.close()
        return StreamingResponse(io.BytesIO(img_data), media_type="image/jpeg", headers={"Content-Disposition": f"attachment; filename={os.path.splitext(file.filename)[0]}.jpg"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF to Image failed: {str(e)}")
    finally:
        if pdf_path and os.path.exists(pdf_path): os.remove(pdf_path)

@app.post("/ppt-to-pdf")
async def ppt_to_pdf_endpoint(file: UploadFile = File(...)):
    if not WIN32_AVAILABLE: throw_win_err()
    pythoncom.CoInitialize()
    ppt_path, pdf_path, ppt_app, pres = None, None, None, None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            tmp.write(await file.read()); ppt_path = tmp.name
        pdf_path = ppt_path + ".pdf"
        ppt_app = win32com.client.Dispatch("PowerPoint.Application")
        pres = ppt_app.Presentations.Open(ppt_path, WithWindow=False)
        pres.SaveAs(pdf_path, 32); pres.Close(); ppt_app.Quit()
        with open(pdf_path, "rb") as f:
            return StreamingResponse(io.BytesIO(f.read()), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={os.path.splitext(file.filename)[0]}.pdf"})
    except Exception as e:
        if ppt_app: ppt_app.Quit()
        raise HTTPException(status_code=500, detail=f"PPT-to-PDF failed: {str(e)}")
    finally:
        pythoncom.CoUninitialize()
        clean_tmp(ppt_path, pdf_path)

@app.post("/excel-to-pdf")
async def excel_to_pdf_endpoint(file: UploadFile = File(...)):
    if not WIN32_AVAILABLE: throw_win_err()
    pythoncom.CoInitialize()
    xl_path, pdf_path, xl_app, wb = None, None, None, None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            tmp.write(await file.read()); xl_path = tmp.name
        pdf_path = xl_path + ".pdf"
        xl_app = win32com.client.Dispatch("Excel.Application")
        xl_app.Visible = False
        wb = xl_app.Workbooks.Open(xl_path)
        wb.ExportAsFixedFormat(0, pdf_path); wb.Close(False); xl_app.Quit()
        with open(pdf_path, "rb") as f:
            return StreamingResponse(io.BytesIO(f.read()), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={os.path.splitext(file.filename)[0]}.pdf"})
    except Exception as e:
        if xl_app: xl_app.Quit()
        raise HTTPException(status_code=500, detail=f"Excel to PDF failed: {str(e)}")
    finally:
        pythoncom.CoUninitialize()
        clean_tmp(xl_path, pdf_path)

@app.post("/resize")
async def resize_app(file: UploadFile = File(...), width: int = Form(...), height: int = Form(...), format: str = Form(...), target_kb: int = Form(...)):
    try:
        image = Image.open(io.BytesIO(await file.read()))
        if format.upper() in ['JPG', 'JPEG']:
            if image.mode in ('RGBA', 'P'): image = image.convert('RGB')
            fmt = 'JPEG'
        else: fmt = format.upper()
        resized = image.resize((width, height), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        if fmt == 'JPEG':
            q_low, q_high, best_q, target = 1, 95, 75, target_kb * 1024
            while q_low <= q_high:
                mid = (q_low + q_high) // 2
                t_buf = io.BytesIO()
                resized.save(t_buf, format='JPEG', quality=mid, optimize=True)
                if t_buf.tell() <= target: best_q, q_low = mid, mid + 1
                else: q_high = mid - 1
            resized.save(buf, format='JPEG', quality=best_q, optimize=True)
        else: resized.save(buf, format=fmt, optimize=True)
        buf.seek(0)
        return StreamingResponse(buf, media_type=f"image/{format.lower()}", headers={"Content-Disposition": f"attachment; filename=resized_{file.filename}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resize failed: {str(e)}")

@app.post("/compress-pdf")
async def compress_pdf(file: UploadFile = File(...), level: str = Form("medium"), target_kb: int = Form(0)):
    in_p, out_p = None, None
    try:
        content = await file.read(); initial_size_kb = len(content) / 1024
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(content); in_p = tmp.name
        out_p = in_p + "_slim.pdf"
        doc = fitz.open(in_p)
        if target_kb > 0:
            if initial_size_kb <= target_kb: doc.save(out_p, garbage=1, deflate=True)
            else: doc.save(out_p, garbage=4, deflate=True, clean=True, linear=True)
        else:
            if level == "fast": doc.save(out_p, garbage=1, deflate=True)
            elif level == "extreme": doc.save(out_p, garbage=4, deflate=True, clean=True, linear=True)
            else: doc.save(out_p, garbage=3, deflate=True)
        doc.close()
        with open(out_p, "rb") as f:
            return StreamingResponse(io.BytesIO(f.read()), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=compressed_{file.filename}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compression failed: {str(e)}")
    finally: clean_tmp(in_p, out_p)

@app.post("/ppt-to-images")
async def ppt_imgs(file: UploadFile = File(...)):
    if not WIN32_AVAILABLE: throw_win_err()
    pythoncom.CoInitialize()
    p_path, d_path, app_ppt, pres = None, None, None, None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            tmp.write(await file.read()); p_path = tmp.name
        d_path = tempfile.mkdtemp()
        app_ppt = win32com.client.Dispatch("PowerPoint.Application")
        pres = app_ppt.Presentations.Open(p_path, WithWindow=False)
        pres.SaveAs(os.path.join(d_path, "slide.jpg"), 17) # 17 = JPG
        pres.Close(); app_ppt.Quit()
        target = os.path.join(d_path, "slide.jpg")
        if os.path.isdir(target):
            items = os.listdir(target)
            if items: target = os.path.join(target, items[0])
        with open(target, "rb") as f:
            return StreamingResponse(io.BytesIO(f.read()), media_type="image/jpeg", headers={"Content-Disposition": "attachment; filename=preview.jpg"})
    except Exception as e:
        if app_ppt: app_ppt.Quit()
        raise HTTPException(status_code=500, detail=f"PPT-to-IMG failed: {str(e)}")
    finally:
        pythoncom.CoUninitialize(); clean_tmp(p_path)

@app.post("/images-to-ppt")
async def imgs_ppt(files: List[UploadFile] = File(...)):
    if not WIN32_AVAILABLE: throw_win_err()
    pythoncom.CoInitialize()
    app_ppt, pres, out_p = None, None, None
    try:
        app_ppt = win32com.client.Dispatch("PowerPoint.Application")
        pres = app_ppt.Presentations.Add(WithWindow=False)
        for f in files:
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(f.filename)[1]) as t:
                t.write(await f.read()); i_p = t.name
            slide = pres.Slides.Add(pres.Slides.Count + 1, 12)
            slide.Shapes.AddPicture(i_p, False, True, 0, 0, 720, 540)
            os.remove(i_p)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as t: out_p = t.name
        pres.SaveAs(out_p); pres.Close(); app_ppt.Quit()
        with open(out_p, "rb") as f:
            return StreamingResponse(io.BytesIO(f.read()), media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", headers={"Content-Disposition": "attachment; filename=presentation.pptx"})
    except Exception as e:
        if app_ppt: app_ppt.Quit()
        raise HTTPException(status_code=500, detail=f"IMGs-to-PPT failed: {str(e)}")
    finally:
        pythoncom.CoUninitialize(); clean_tmp(out_p)

@app.post("/pdf-to-ppt")
async def pdf_ppt(file: UploadFile = File(...)):
    if not WIN32_AVAILABLE: throw_win_err()
    pythoncom.CoInitialize()
    pdf_p, app_ppt, pres, out_p = None, None, None, None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as t:
            t.write(await file.read()); pdf_p = t.name
        doc = fitz.open(pdf_p); app_ppt = win32com.client.Dispatch("PowerPoint.Application")
        pres = app_ppt.Presentations.Add(WithWindow=False)
        for i in range(len(doc)):
            img_p = f"{pdf_p}_{i}.jpg"; doc.load_page(i).get_pixmap().save(img_p)
            slide = pres.Slides.Add(pres.Slides.Count+1, 12)
            slide.Shapes.AddPicture(img_p, False, True, 0, 0, 720, 540); os.remove(img_p)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as t: out_p = t.name
        pres.SaveAs(out_p); pres.Close(); app_ppt.Quit(); doc.close()
        with open(out_p, "rb") as f:
            return StreamingResponse(io.BytesIO(f.read()), media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", headers={"Content-Disposition": "attachment; filename=pdf_to.pptx"})
    except Exception as e:
        if app_ppt: app_ppt.Quit()
        raise HTTPException(status_code=500, detail=f"PDF-to-PPT failed: {str(e)}")
    finally:
        pythoncom.CoUninitialize(); clean_tmp(pdf_p, out_p)

def throw_win_err(): raise HTTPException(status_code=501, detail="Microsoft Object Synthesis requires a Windows Host Environment.")
def clean_tmp(*paths):
    for p in paths:
        if p and os.path.exists(p): os.remove(p)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
