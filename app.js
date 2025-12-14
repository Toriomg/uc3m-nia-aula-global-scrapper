(async function() {
    console.clear();
    console.log("🔓 Iniciando script DESENCRIPTADOR...");

    // 1. Localizar la tabla
    let allTables = document.querySelectorAll("table");
    let targetTable = null;
    for (let table of allTables) {
        if (table.innerText.includes("Nombre") || table.innerText.includes("Surname") || table.querySelector("a[href*='user/view.php']")) {
            targetTable = table;
            break;
        }
    }

    if (!targetTable) { console.error("❌ No encuentro la tabla."); return; }

    // 2. Preparar filas
    let rows = targetTable.querySelectorAll("tr");
    let validRows = Array.from(rows).filter(row => row.querySelector("a[href*='user/view.php']"));
    
    let csvContent = "data:text/csv;charset=utf-8,Nombre,NIA,Correo,Link_Perfil\n";
    let processed = 0;
    let total = validRows.length;

    console.log(`🕵️ Detectados ${total} alumnos. Desencriptando datos ocultos...`);

    // 3. Función de limpieza agresiva
    async function getDecodedData(url) {
        try {
            const response = await fetch(url, { credentials: 'include' });
            let rawText = await response.text();
            
            // PASO CLAVE: Intentamos desencriptar el texto 2 veces (por si tiene doble codificación)
            let decodedText = rawText;
            try { decodedText = decodeURIComponent(decodedText); } catch(e){}
            try { decodedText = decodeURIComponent(decodedText); } catch(e){} // Doble pasada a veces necesaria

            // 1. Buscamos patrón limpio: 100xxxxxx (6 a 9 dígitos)
            let niaMatch = decodedText.match(/100\d{6,9}/);
            
            // 2. Si no, buscamos patrón de correo y lo limpiamos
            let emailMatch = decodedText.match(/([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/);

            let nia = "No encontrado";
            let email = "No encontrado";

            if (niaMatch) {
                nia = niaMatch[0];
            }

            if (emailMatch) {
                // A veces el email también sale sucio (ej: 100444%40alumnos...) -> Lo limpiamos
                email = emailMatch[0].replace("%40", "@");
                
                // Si no teníamos NIA pero sí email, sacamos el NIA del email
                if (nia === "No encontrado" && email.includes("100")) {
                    let posibleNIA = email.split("@")[0];
                    if (/100\d+/.test(posibleNIA)) {
                        nia = posibleNIA;
                    }
                }
            }

            return { nia, email };

        } catch (err) {
            return { nia: "Error", email: "Error" };
        }
    }

    // 4. Ejecutar
    for (const row of validRows) {
        let nameLink = row.querySelector("a[href*='user/view.php']");
        let nombre = nameLink.textContent.trim().replace(/"/g, '""');
        let link = nameLink.href;

        let data = await getDecodedData(link);

        csvContent += `"${nombre}","${data.nia}","${data.email}","${link}"\n`;

        processed++;
        // Feedback visual en consola
        if (data.nia !== "No encontrado") {
            console.log(`✅ [${processed}/${total}] ${nombre} -> ${data.nia}`);
        } else {
            console.log(`⚠️ [${processed}/${total}] ${nombre} -> Sin datos (Privacidad extrema)`);
        }
    }

    // 5. Descargar
    let encodedUri = encodeURI(csvContent);
    let linkDown = document.createElement("a");
    linkDown.setAttribute("href", encodedUri);
    linkDown.setAttribute("download", "LISTA_CLASE_DESENCRIPTADA.csv");
    document.body.appendChild(linkDown);
    linkDown.click();
    document.body.removeChild(linkDown);
    
    console.log("🎉 ¡Terminado! Abre el Excel.");
})();
