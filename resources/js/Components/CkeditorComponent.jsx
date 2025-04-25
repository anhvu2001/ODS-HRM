import React, { useEffect } from "react";
import { useState } from "react";
import "../../css/skeleton.css";
export default function CkeditorComponent({
    readOnly,
    setFormData,
    defaultDescription,
    editorId,
}) {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const scriptUrl = "/assets/ckeditor4/ckeditor.js";
        let script = document.querySelector(`script[src="${scriptUrl}"]`);
        if (!script) {
            script = document.createElement("script");
            script.src = scriptUrl;
            script.async = true;
            script.onload = initializeEditor;
            document.body.appendChild(script);
        } else if (window.CKEDITOR) {
            initializeEditor();
        }

        function initializeEditor() {
            if (window.CKEDITOR) {
                const editor = window.CKEDITOR.replace(editorId);
                if (editor) {
                    editor?.on("instanceReady", function () {
                        editor.setData(defaultDescription);
                        setLoading(false);
                    });
                }

                editor?.on("change", function () {
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        description: editor.getData(),
                    }));
                });
            }
        }

        return () => {
            if (window.CKEDITOR && window.CKEDITOR.instances.editor) {
                window.CKEDITOR.instances.editor.destroy(true);
            }
        };
    }, [setFormData]);

    return (
        <div>
            {/* skeleton */}
            {loading && (
                <div className="h-[300px] border">
                    <div className="h-[75px] bg-[#f8f8f8] p-2 border-b">
                        <div className="skeleton skeleton-widget"></div>
                        <div className="skeleton skeleton-widget"></div>
                    </div>
                    <div className=" p-2 px-3">
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text"></div>
                    </div>
                    <div className="h-[25px] bg-[#f8f8f8]"></div>
                </div>
            )}
            <div className={`${loading ? `opacity-0 max-h-0` : `opacity-100`}`}>
                <textarea id={editorId} name="editor1" readOnly={readOnly} />
            </div>
        </div>
    );
}
