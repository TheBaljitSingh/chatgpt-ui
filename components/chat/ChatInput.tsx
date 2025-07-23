"use client"
import { Plus, Mic, AudioLines, Square, ArrowUp, ImagePlus, X, FileIcon } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { useEffect, useRef, useState } from 'react';
import { FileAttachment } from "@/types"
import axios from "axios";


interface ChatInpuptProps {
  onSend: (message: string, attachments?:FileAttachment[]) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  maxRows?: number;
  onStopGeneration?: () => void,
  isLoading?: boolean;
  editingContent?: string

}


export function ChatInput({
  onSend,
  placeholder = "Ask anything",
  disabled = false,
  maxRows = 6,

  onStopGeneration,
  isLoading = false,
  editingContent


}: ChatInpuptProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const plusButtonRef = useRef<HTMLDivElement | null>(null);
  const [isPlusButtonOpen, setIsPlusButtonOpen] = useState(false);

  const handleSend = () => {
    // if (!message.trim() || attachments.length==0) return;

    const completedAttachments = attachments.filter(att=>!att.isUploading); // have to add the status  for file upload

    onSend(message,completedAttachments);
    setMessage('');
    setAttachments([]);

  };



  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  const handlePlusButton = () => {
    setIsPlusButtonOpen((prev) => !prev);

  }

  const handleAttachFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.txt,.doc,.docx';
    input.multiple = true;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      setIsPlusButtonOpen(false); // Close the menu

      Array.from(files).forEach(async (file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
          return;
        }

        const tempId = `temp-${Date.now()}-${Math.random()}`;
        // setUploadingFiles(prev => [...prev, tempId]);

        setAttachments(prev=>[
          ...prev,
          {
            id: tempId,
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file), // temporary local url for preview
            cloudinaryId: '',
            isUploading: true,
            uploadProgress: 0,
          }
        ]);



        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string
        );

        try {
          const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
            formData,
            {
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / (progressEvent.total || 1)
                );
                setAttachments(prev=>
                  
                  prev.map(att=>att.id===tempId? {
                    ...att, uploadProgress:percentCompleted
                  }:att)
                )
                console.log(`Upload progress: ${percentCompleted}%`);
              }
            }
          );

          const data = res.data;

          setAttachments((prev) => 
            prev.map(att=>att.id===tempId?{
              ...att, 
              url: data.secure_url,
              cloudinaryId:data.public_id,
              isUploading:false,
              uploadProgress:100,
            }:att
          )
          );
        } catch (err) {
          alert(`Failed to upload "${file.name}". Please try again.`);
          setAttachments(prev => prev.filter(att => att.id !== tempId)); // it work as boolean it return new array ' who is not matching with att.id===tempId'
        } finally {
        }
      });
    };

    input.click();
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const DocumentPreview = ({ attachment }: { attachment: FileAttachment }) => {
    const isImage = attachment.type?.startsWith('image/');
    const fileType = attachment.type.split("/")[1].toUpperCase();

    return (
       <div className="relative flex items-center gap-2 p-2 bg-transparent  ">
        <div className="flex-shrink-0 relative">
          {isImage ? (

            <div className=' rounded-2xl'>
                <button
                onClick={() => removeAttachment(attachment.id)} // replace with your remove handler
                className="absolute top-1.5 right-2 bg-white rounded-full text-black hover:cursor-pointer text-xs"
                >
                  <X size={16} />
              </button>
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-32 h-32 object-cover rounded-xl"
              />
              </div>
          ) : (
  

            <div className="flex items-center w-sm max-w-xs bg-[#2e2e2e] rounded-xl p-2 relative border justify-between border-gray-600">
              {/* File Icon */}
              <div className='flex'>
                <div className="bg-[#ff5588] rounded-lg w-10 h-10 flex items-center justify-center mr-3">
                <FileIcon size={20} className="text-white" />
              </div>

              {/* Text Info */}
              <div className="flex flex-col overflow-hidden ">
                <span className="text-sm font-medium text-white truncate">{attachment.name}</span>
                <span className="text-xs text-gray-400 truncate">{fileType}</span>
              </div>
              </div>

              {/* Close Button */}
              <div>

              <button
                onClick={() => removeAttachment(attachment.id)} // replace with your remove handler
                className="absolute top-1.5 right-2 bg-white rounded-full  text-black hover:cursor-pointer text-xs"
                >
                  <X size={16} />
              </button>

                </div>
            </div>




          )}
          
          {/* Upload Progress Overlay */}
          {attachment.isUploading &&(
            <div className={`absolute inset-0 bg-opacity-50 rounded-xl flex items-center justify-center`}  style={{ backgroundImage: `url(${attachment.url})` }}>
              <div className="flex flex-col items-center gap-2">
                {/* Circular Progress */}
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="white"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - (attachment.uploadProgress || 0) / 100)}`}
                      className="transition-all duration-200"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* <span className="text-white text-sm font-bold">
                      {attachment.uploadProgress || 0}%
                    </span> */}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* <img src={attachment.url} alt="" /> */}

          {/* Remove Button - Only show when not uploading */}
          {/* {!attachment.isUploading && (
            <button
              onClick={() => removeAttachment(attachment.id)}
              className="absolute -top-2 -right-2 flex-shrink-0 p-1 text-black hover:cursor-pointer bg-white rounded-full transition-colors shadow-lg"
            >
              <X size={16} />
            </button>
          )} */}
        </div>
      </div>
    );
  };

  useEffect(() => {


    if (editingContent !== undefined) {
      setMessage(editingContent);

    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        plusButtonRef.current &&
        !plusButtonRef.current.contains(event.target as Node)
      ) {
        setIsPlusButtonOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  return (
    <div className="w-full px-12 max-w-4xl mx-auto ">
      <div className="relative bg-[#303030] rounded-3xl border border-gray-600 shadow-lg hover:shadow-xl transition-shadow sm:mb-2  ">

          <div>

            
                  {attachments.length > 0 && (
                    <div className="w-full mb-2 px-4 flex flex-wrap gap-2">
                      {attachments.map((attachment, index) => (
                        <div
                        key={attachment.id}
                        className="opacity-0 animate-fadeInUp"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animationFillMode: 'forwards'
                        }}
                        >

                          <DocumentPreview attachment={attachment} />
                        </div>
                      ))}
                    </div>
                  )}  

          </div>
          <div className="max-w-4xl mx-auto ">

          <div className="flex  flex-col min-h-[60px] ">
            {/* Text Input Area - 90% Height */}
            <div className="flex-1 px-4 pt-5 pb-2" style={{ minHeight: '90%' }}>
              <TextareaAutosize
                minRows={1}
                maxRows={maxRows}
                placeholder={placeholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled || isLoading}

                className="w-full h-full resize-none bg-transparent text-white placeholder-gray-400 border-none outline-none text-base leading-6"
              // style={{ height: 'auto' } }
              />
            </div>

            {/* Icon Row - 10% Height */}
            <div className="h-[10%] min-h-[40px] px-4 pb-3 border-gray-600">
              <div className="flex items-center justify-between h-full">
                {/* Left Side Icons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlusButton}
                    disabled={disabled || isLoading}
                    className="p-2 hover:cursor-pointer text-gray-400 hover:text-gray-300 hover:bg-gray-400 rounded-lg transition-colors">
                    <Plus size={18} />
                  </button>
                  {isPlusButtonOpen && (
                    <div
                      onClick={handleAttachFile}
                      ref={plusButtonRef}
                      className="absolute bottom-14 left-0 flex bg-[#303030] border-black text-white shadow-xl hover:bg-[#3d3d3d] rounded-lg w-44 py-2 z-50 animate-fade-in"
                    >
                      <button className="w-full h-full hover:cursor-pointer p-2 px-4 py-2 text-left text-sm  rounded transition">
                        <ImagePlus size={22} className="inline-block mr-2 " />
                        Add Photo & File
                      </button>
                    </div>
                  )}


                  {/* <button
                    onClick={onAttachImage}
                    disabled={disabled || isLoading}
                  className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-600 rounded-lg transition-colors">
                    <ImageIcon size={18} />
                  </button> */}
                  {/* Commented icons */}

                </div>

                {/* Right Side Icons */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={disabled || isLoading}
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-600 rounded-lg transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                  >
                    <Mic size={18} />
                  </button>


                  {(message.trim() || attachments.length>0) ? (
                    <div>


                      <button
                        disabled={disabled || isLoading}
                        onClick={handleSend}
                        className="p-2 rounded-2xl bg-white hover:cursor-pointer text-gray-900  hover:bg-gray-100 transition-colors disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300"
                      >
                        <ArrowUp size={18} />
                      </button>
                    </div>
                  ) : isLoading ? (
                    <div>

                      <button
                        onClick={onStopGeneration}
                        className="p-1 hover:cursor-pointer bg-white text-white rounded-lg  transition-colors"
                      >
                        <Square fill='black' className='' />

                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={disabled || isLoading}
                      className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-600 rounded-lg transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                    >
                      <AudioLines size={18} />
                    </button>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        {/* <p className="text-xs text-gray-400 text-center mt-2 px-4">
          ChatGPT can make mistakes. Check important info.
        </p> */}
      </div>
    </div>
  );
}