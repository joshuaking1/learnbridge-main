// src/components/forum/RichTextEditor.tsx
import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { enhancedForumService } from '@/services/enhancedForumService';
import { useAuth } from '@/context/AuthContext';
import { forumBotService } from '@/services/forumBotService';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded"></div>,
});

// MathJax module for Quill
const MathJax = {
  register() {
    const Quill = require('quill');
    var Inline = Quill.import('blots/inline');

    class MathJaxInline extends Inline {
      static create(value: any) {
        let node = super.create();
        node.setAttribute('data-formula', value);
        return node;
      }

      static formats(node: any) {
        return node.getAttribute('data-formula');
      }
    }

    MathJaxInline.blotName = 'mathJax';
    MathJaxInline.tagName = 'span';
    MathJaxInline.className = 'math-tex';

    Quill.register(MathJaxInline, true);
  }
};

interface Props {
  initialValue?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  readOnly?: boolean;
}

const RichTextEditor: React.FC<Props> = ({
  initialValue = '',
  onChange,
  placeholder = 'Write something...',
  minHeight = '200px',
  readOnly = false,
}) => {
  const [content, setContent] = useState(initialValue);
  const [isRecording, setIsRecording] = useState(false);
  const quillRef = useRef<any>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { token, getToken } = useAuth();

  useEffect(() => {
    // Initialize MathJax after component mount
    if (typeof window !== 'undefined') {
      MathJax.register();

      // Load MathJax script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
      script.async = true;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['formula'],
        ['clean']
      ],
      handlers: {
        image: readOnly ? undefined : handleImageUpload
      }
    },
    clipboard: {
      matchVisual: false,
    },
  };

  async function handleImageUpload() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      if (!input.files?.length || !quillRef.current) return;

      const file = input.files[0];
      
      try {
        const t = await getToken();
        if (!t) return;

        const response = await enhancedForumService.uploadMedia(t, file);
        
        // Get the range where the image will be inserted
        const range = quillRef.current.getEditor().getSelection(true);
        
        // Insert the image
        quillRef.current.getEditor().insertEmbed(range.index, 'image', response.url);
        // Move cursor after image
        quillRef.current.getEditor().setSelection(range.index + 1);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      }
    };
  }

  const handleContentChange = (value: string) => {
    setContent(value);
    onChange(value);
  };

  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('Voice recording is not supported in your browser');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      recorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        try {
          const t = await getToken();
          if (!t) return;
          
          // Call the transcription service
          const text = await forumBotService.transcribeSpeech(t, audioBlob);
          
          // Insert the transcribed text at the current cursor position
          if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection() || { index: editor.getLength(), length: 0 };
            editor.insertText(range.index, text + ' ');
          }
        } catch (error) {
          console.error('Error transcribing speech:', error);
          alert('Failed to transcribe speech. Please try again.');
        } finally {
          setIsRecording(false);
          
          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Failed to start voice recording. Please check your microphone permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
    }
  };

  useEffect(() => {
    // Setup formula rendering with MathJax after content changes
    if (typeof window !== 'undefined' && window.MathJax) {
      const timer = setTimeout(() => {
        window.MathJax.typeset();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [content]);

  return (
    <div className="w-full">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleContentChange}
        modules={modules}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{ minHeight }}
      />
      
      {!readOnly && (
        <div className="flex items-center mt-2">
          <button
            type="button"
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`flex items-center px-3 py-1 rounded text-sm ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            {isRecording ? 'Stop Recording' : 'Voice Input'}
          </button>
          {isRecording && <span className="ml-2 text-sm text-red-500 animate-pulse">Recording...</span>}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
