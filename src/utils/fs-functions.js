import fs from 'fs/promises';

export const readJsonFile = async () => {
    try {
        return JSON.parse(await fs.readFile('./src/database/database.json'));
    } catch (error) {
        return res.status(400).json({ Erro: error.message });
    }
}

export const partiallyRewriteJsonFile = async (updatedProperty) => {
    try {
        const fullParsedJsonFile = await readJsonFile();

        const newFileContent = {
            ...fullParsedJsonFile,
            ...updatedProperty
        }

        const newStringifiedJsonFile = JSON.stringify(newFileContent, null, 4);
        await fs.writeFile('./src/database/database.json', newStringifiedJsonFile);
    } catch (error) {
        return res.status(400).json({ Erro: error.message });
    }
}