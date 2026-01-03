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

# Footer
st.markdown("---")
st.markdown("💡 **Tip:** For best results, use clear audio with minimal background noise.")

# Beautiful styled footer
st.markdown("""
    <style>
    .footer-note {
        text-align: center;
        padding: 20px;
        margin-top: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    .footer-text {
        color: white;
        font-size: 24px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: 2px;
        direction: rtl;
    }
    </style>
    <div class="footer-note">
        <div class="footer-text">✨ برای داداشم خوش خوش ✨</div>
    </div>
""", unsafe_allow_html=True)
