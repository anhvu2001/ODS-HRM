export async function convertFilePathToFile(filePath, fileName = null) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const blob = await response.blob();
        const name = fileName || filePath.split("/").pop(); // Lấy tên file nếu không truyền vào
        return new File([blob], name, { type: blob.type }); // Tạo File từ Blob
    } catch (error) {
        console.error("Error converting file path to File:", error);
        throw error;
    }
}
