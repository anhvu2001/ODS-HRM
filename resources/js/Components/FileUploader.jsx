import React, { useRef } from "react";

function FileUploader({ selectedFile, onFileSelect, onRemoveFile }) {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (onFileSelect) onFileSelect(file);
    };

    const handleRemoveFile = () => {
        if (onRemoveFile) onRemoveFile();
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    };
    return (
        <div className="max-w-[150px]">
            <label htmlFor="file-input" style={{ cursor: "pointer" }}>
                <img
                    src="/icon-file-upload.png"
                    alt="Đính kèm tệp"
                    style={{ width: "24px", height: "24px" }}
                />
            </label>
            <input
                type="file"
                id="file-input"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
            {selectedFile && (
                <div>
                    <span className="text-xs">
                        {selectedFile.name} (
                        {(selectedFile.size / 1024).toFixed(2)} KB)
                    </span>
                    <button
                        className="text-red-700"
                        type="button"
                        onClick={handleRemoveFile}
                        style={{ marginLeft: "10px" }}
                    >
                        Xóa
                    </button>
                </div>
            )}
        </div>
    );
}

export default FileUploader;
