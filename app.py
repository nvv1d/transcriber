import streamlit as st
import os
import math
import tempfile
import speech_recognition as sr
from pydub import AudioSegment
from docx import Document
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from docx.shared import Pt

# Page configuration
st.set_page_config(
    page_title="Audio Transcription Tool",
    page_icon="🎤",
    layout="centered"
)

# Force light mode and add Nyan Cat cursor
st.markdown("""
    <style>
    /* Force light mode */
    [data-testid="stAppViewContainer"] {
        background-color: white !important;
    }
    [data-testid="stHeader"] {
        background-color: white !important;
    }
    [data-testid="stSidebar"] {
        background-color: #f0f2f6 !important;
    }
    section[data-testid="stSidebar"] > div {
        background-color: #f0f2f6 !important;
    }
    .main {
        background-color: white !important;
    }
    
    /* Nyan Cat cursor */
    * {
        cursor: url(http://www.rw-designer.com/cursor-extern.php?id=170394), auto !important;
    }
    </style>
""", unsafe_allow_html=True)

# Title and description
st.title("🎤 Audio Transcription Tool")
st.markdown("""
Upload an audio file (MP4, MP3, WAV, M4A) and get an automatic transcription in Persian (Farsi).
The transcription will be saved as a Word document.
""")

# File uploader
uploaded_file = st.file_uploader(
    "Choose an audio file",
    type=["mp4", "mp3", "wav", "m4a"],
    help="Supported formats: MP4, MP3, WAV, M4A"
)

def transcribe_audio(audio_file):
    """
    Transcribes the uploaded audio file and returns a DOCX document.
    """
    # Setup recognizer
    recognizer = sr.Recognizer()
    recognizer.energy_threshold = 300
    
    # Create Word document
    doc = Document()
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Tahoma'
    font.size = Pt(11)
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.name)[1]) as tmp_file:
        tmp_file.write(audio_file.getvalue())
        tmp_path = tmp_file.name
    
    try:
        # Load and process audio
        st.info("🎧 Loading audio file...")
        audio = AudioSegment.from_file(tmp_path)
        audio = audio.set_channels(1).set_frame_rate(16000)
        
        chunk_length_ms = 30 * 1000  # 30 seconds
        total_length_ms = len(audio)
        total_chunks = math.ceil(total_length_ms / chunk_length_ms)
        
        st.success(f"🚀 Starting transcription of {total_chunks} chunk(s)...")
        
        # Progress bar
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        # Process each chunk
        for i in range(total_chunks):
            start_ms = i * chunk_length_ms
            end_ms = start_ms + chunk_length_ms
            chunk = audio[start_ms:end_ms]
            
            # Create temporary WAV file for the chunk
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as chunk_file:
                chunk.export(chunk_file.name, format="wav")
                
                with sr.AudioFile(chunk_file.name) as source:
                    audio_data = recognizer.record(source)
                    text = ""
                    try:
                        text = recognizer.recognize_google(audio_data, language='fa-IR')
                        status_text.text(f"[{i+1}/{total_chunks}] Transcribed: {text[:50]}...")
                    except sr.UnknownValueError:
                        status_text.text(f"[{i+1}/{total_chunks}] Could not understand audio (silence?).")
                    except sr.RequestError as e:
                        status_text.text(f"[{i+1}/{total_chunks}] API request failed: {e}")
                    
                    if text:
                        p = doc.add_paragraph(text)
                        p.alignment = WD_PARAGRAPH_ALIGNMENT.RIGHT
                
                # Clean up chunk file
                os.unlink(chunk_file.name)
            
            # Update progress
            progress_bar.progress((i + 1) / total_chunks)
        
        # Save document to temporary file
        output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".docx").name
        doc.save(output_path)
        
        # Clean up original audio file
        os.unlink(tmp_path)
        
        return output_path
        
    except Exception as e:
        os.unlink(tmp_path)
        st.error(f"❌ An error occurred during processing: {e}")
        return None

# Process button and transcription
if uploaded_file is not None:
    if st.button("🎯 Start Transcription", type="primary"):
        with st.spinner("Processing..."):
            output_file = transcribe_audio(uploaded_file)
            
            if output_file:
                st.success("✅ Processing Complete!")
                
                # Read the file for download
                with open(output_file, "rb") as file:
                    st.download_button(
                        label="📥 Download Transcription (DOCX)",
                        data=file,
                        file_name=f"{os.path.splitext(uploaded_file.name)[0]}_transcribed.docx",
                        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    )
                
                # Clean up output file
                os.unlink(output_file)

# Footer with tip and dedication
st.markdown("---")

st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400&display=swap');
    
    .footer-container {
        padding: 20px 0;
        text-align: center;
    }
    
    .tip-text {
        color: #6b7280;
        font-size: 14px;
        margin-bottom: 15px;
    }
    
    .footer-decoration {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        margin-top: 10px;
        margin-bottom: 20px;
    }
    
    .line {
        width: 60px;
        height: 1px;
        background: linear-gradient(90deg, transparent, #9ca3af, transparent);
    }
    
    .dot {
        width: 4px;
        height: 4px;
        background: #6b7280;
        border-radius: 50%;
    }
    
    .footer-text {
        color: #4b5563;
        font-size: 16px;
        font-weight: 300;
        font-family: 'Vazirmatn', 'Tahoma', sans-serif;
        letter-spacing: 0.5px;
    }
    
    .iframe-wrapper {
        margin-top: 15px;
        display: inline-block;
    }
    
    .iframe-wrapper iframe {
        border: none;
        background: transparent;
    }
    </style>
    
    <div class="footer-container">
        <div class="tip-text">💡 <strong>Tip:</strong> For best results, use clear audio with minimal background noise.</div>
        <div class="footer-decoration">
            <div class="line"></div>
            <div class="dot"></div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span class="footer-text">For Mamad Khoshi</span>
            <div class="dot"></div>
            <div class="line"></div>
        </div>
        <div class="iframe-wrapper">
            <iframe width="110" height="250" src="https://www.myinstants.com/instant/i-got-you-homie-mp3-47990/embed/" frameborder="0" scrolling="no"></iframe>
        </div>
    </div>
""", unsafe_allow_html=True)
