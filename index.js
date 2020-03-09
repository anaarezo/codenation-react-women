require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const fs = require('fs');
const FormData = require('form-data');

function decryptJC(text, offset) {
    const textLower = text.toLowerCase();
    let decrypted = "";
    for (let i = 0; i < textLower.length; i++) {

        const char = textLower[i];
        const charcode = char.charCodeAt();

        if (char.match(/[a-z]/)) {
            if (charcode - offset < 97) {
                const diff = 97 - (charcode - offset);
                decrypted += String.fromCharCode(123 - diff);
            } else {
                const charcode = char.charCodeAt() - offset;
                decrypted += String.fromCharCode(charcode);
            }
        } else {
            decrypted += char;
        }
    }
    return decrypted;
}
async function main() {
    const token = process.env.API_TOKEN;
    const response = await axios.get(
        `https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${token}`
    )

    const decrypted = decryptJC(
        response.data.cifrado,
        response.data.numero_casas
    );
    console.log(response.data);
    console.log(decrypted);

    const hash = crypto.createHash("sha1").update(decrypted, "utf8").digest("hex");
    console.log(hash);

    const answer = {
        ...response.data,
        decifrado: decrypted,
        resumo_criptografico: hash
    };

    fs.writeFileSync("answer.json", JSON.stringify(answer));

    const data = new FormData();
    data.append("answer", fs.createReadStream("answer.json"));

    const submissionResult = await axios.post(
        `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${token}`,
        data,
        {
            headers: data.getHeaders()
        }
    );

    console.log(submissionResult.data);

//    console.log(`Score: ${submissionResult.data.score}`);
}

main();