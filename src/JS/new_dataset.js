// new_dataset.js

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
