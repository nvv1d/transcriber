import streamlit as st
import os
import math
import tempfile
import speech_recognition as sr
from pydub import AudioSegment
from docx import Document
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from docx.shared import Pt

# 1. Page Configuration
st.set_page_config(
    page_title="Audio Transcription Tool",
    page_icon="🎤",
    layout="centered"
)

# 2. Brutal UI Removal (Updated with GitHub #9579 definitive selectors)
st.markdown("""
    <style>
    /* 1. Hide the top toolbar/deploy button */
    div[data-testid="stToolbar"] {
        display: none !important;
    }
    
    /* 2. Hide the colored line at the top */
    div[data-testid="stDecoration"] {
        display: none !important;
    }
    
    /* 3. Hide the status widget (running icon/connection banner) */
    div[data-testid="stStatusWidget"] {
        visibility: hidden !important;
    }

    /* 4. Hide Footer and Profile Badges */
    footer {visibility: hidden !important;}
    [class*="_viewerBadge"], [class*="_profileContainer"] {
        display: none !important;
    }

    /* Set RTL for Farsi text display */
    .stMarkdown, .stText {
        direction: rtl;
        text-align: right;
    }
    </style>
""", unsafe_allow_html=True)

# 3. App UI Header
st.title("🎤 Audio Transcription Tool")
st.markdown("""
Upload an audio file (MP4, MP3, WAV, M4A) and get an automatic transcription in Persian (Farsi).
The transcription will be saved as a Word document.
""")

# 4. File Uploader
uploaded_file = st.file_uploader(
    "Choose an audio file",
    type=["mp4", "mp3", "wav", "m4a"],
    help="Supported formats: MP4, MP3, WAV, M4A"
)

def transcribe_audio(audio_file):
    recognizer = sr.Recognizer()
    recognizer.energy_threshold = 300
    
    doc = Document()
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Tahoma'
    font.size = Pt(11)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.name)[1]) as tmp_file:
        tmp_file.write(audio_file.getvalue())
        tmp_path = tmp_file.name
    
    try:
        st.info("🎧 Loading audio file...")
        audio = AudioSegment.from_file(tmp_path)
        audio = audio.set_channels(1).set_frame_rate(16000)
        
        chunk_length_ms = 30 * 1000 
        total_length_ms = len(audio)
        total_chunks = math.ceil(total_length_ms / chunk_length_ms)
        
        st.success(f"🚀 Starting transcription of {total_chunks} chunk(s)...")
        
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        for i in range(total_chunks):
            start_ms = i * chunk_length_ms
            end_ms = start_ms + chunk_length_ms
            chunk = audio[start_ms:end_ms]
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as chunk_file:
                chunk.export(chunk_file.name, format="wav")
                
                with sr.AudioFile(chunk_file.name) as source:
                    audio_data = recognizer.record(source)
                    try:
                        text = recognizer.recognize_google(audio_data, language='fa-IR')
                        status_text.text(f"[{i+1}/{total_chunks}] Transcribed: {text[:50]}...")
                    except sr.UnknownValueError:
                        status_text.text(f"[{i+1}/{total_chunks}] Silence or unrecognized.")
                        text = ""
                    except sr.RequestError as e:
                        status_text.text(f"[{i+1}/{total_chunks}] API Error: {e}")
                        text = ""
                    
                    if text:
                        p = doc.add_paragraph(text)
                        p.alignment = WD_PARAGRAPH_ALIGNMENT.RIGHT
                os.unlink(chunk_file.name)
            progress_bar.progress((i + 1) / total_chunks)
        
        output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".docx").name
        doc.save(output_path)
        os.unlink(tmp_path)
        return output_path
        
    except Exception as e:
        if os.path.exists(tmp_path): os.unlink(tmp_path)
        st.error(f"❌ Error: {e}")
        return None

# 5. Logic execution
if uploaded_file is not None:
    if st.button("🎯 Start Transcription", type="primary"):
        with st.spinner("Processing..."):
            output_file = transcribe_audio(uploaded_file)
            if output_file:
                st.success("✅ Processing Complete!")
                with open(output_file, "rb") as file:
                    st.download_button(
                        label="📥 Download Transcription (DOCX)",
                        data=file,
                        file_name=f"{os.path.splitext(uploaded_file.name)[0]}_transcribed.docx",
                        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    )
                os.unlink(output_file)

# 6. Custom Dedicated Footer
st.markdown("---")
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400&display=swap');
    .footer-container { text-align: center; padding: 20px 0; }
    .tip-text { color: #6b7280; font-size: 14px; margin-bottom: 15px; }
    .footer-decoration { display: flex; justify-content: center; align-items: center; gap: 12px; }
    .line { width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #9ca3af, transparent); }
    .footer-text { color: #4b5563; font-size: 16px; font-family: 'Vazirmatn', sans-serif; }
    </style>
    <div class="footer-container">
        <div class="tip-text">💡 <strong>Tip:</strong> For best results, use clear audio with minimal background noise.</div>
        <div class="footer-decoration">
            <div class="line"></div>
            <span class="footer-text">For Mamad Khoshi</span>
            <div class="line"></div>
        </div>
        <br>
        <iframe width="110" height="200" src="https://www.myinstants.com/instant/i-got-you-homie-mp3-47990/embed/" frameborder="0" scrolling="no"></iframe>
    </div>
""", unsafe_allow_html=True)
