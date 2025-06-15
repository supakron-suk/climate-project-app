// new_dataset.js
export const sendFileToBackend = async (file, content, BACKEND_URL) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("content", content);

    console.log("Sending file to:", `${BACKEND_URL}/upload`);
    console.log("File name:", file.name);

    try {
        const response = await fetch(`${BACKEND_URL}/upload`, {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        console.log("Response from Backend:", result);
        return result;  
    } catch (error) {
        console.error("Error sending file:", error);
    }
};



export const new_dataset = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const fileContent = event.target.result;
            console.log("File Content:", fileContent); 
            resolve(fileContent);
        };

        reader.onerror = () => {
            console.error("Error reading file");
            reject(new Error("Error reading file"));
        };

        reader.readAsText(file); 
    });
};



// export const new_dataset = (file) => {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();

//         reader.onload = (event) => {
//             const fileContent = event.target.result;
//             console.log("File Content:", fileContent); 
//             resolve(fileContent);
//         };

//         reader.onerror = () => {
//             console.error("Error reading file");
//             reject(new Error("Error reading file"));
//         };

//         reader.readAsText(file); 
//     });
// };
