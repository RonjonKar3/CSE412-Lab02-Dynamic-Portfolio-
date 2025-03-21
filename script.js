document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("portfolioForm");
    const pdfButtonContainer = document.getElementById("pdfButtonContainer");
    const editButton = document.getElementById("editPortfolio");
    const downloadPdfButton = document.getElementById("downloadPdf");

    let imageDataUrl = "";

    document.getElementById("image").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const preview = document.getElementById("imagePreview");
                preview.src = e.target.result;
                preview.style.display = "block";
                imageDataUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    function addSection(containerId, entryHtml) {
        const container = document.getElementById(containerId);
        const newEntry = document.createElement("div");
        newEntry.innerHTML = entryHtml;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.classList.add("remove-btn");
        removeButton.addEventListener("click", function () {
            container.removeChild(newEntry);
        });

        newEntry.appendChild(removeButton);
        container.appendChild(newEntry);
    }

    document.getElementById("addAcademic").addEventListener("click", function () {
        addSection("academicContainer", `
            <div class="academic-entry">
                <input type="text" name="institution" placeholder="Institution Name" required>
                <input type="text" name="degree" placeholder="Degree" required>
                <input type="text" name="year" placeholder="Year" required>
                <input type="text" name="grade" placeholder="Grade" required>
            </div>
        `);
    });

    document.getElementById("addSkills").addEventListener("click", function () {
        addSection("skillsContainer", `
        <div class="skills-entry">
            <input type="text" name="softSkills" placeholder="Soft Skills" required>
            <input type="text" name="techSkills" placeholder="Technical Skills" required>
        </div>
        `);
    });

    document.getElementById("addWork").addEventListener("click", function () {
        addSection("workContainer", `
            <div class="work-entry">
                <input type="text" name="company" placeholder="Company Name" required>
                <input type="text" name="duration" placeholder="Job Duration" required>
                <textarea name="responsibilities" placeholder="Job Responsibilities" required></textarea>
            </div>
        `);
    });

    document.getElementById("addProject").addEventListener("click", function () {
        addSection("projectsContainer", `
            <div class="project-entry">
                <input type="text" name="projectTitle" placeholder="Project/Publication Title" required>
                <textarea name="projectDesc" placeholder="Description" required></textarea>
            </div>
        `);
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        form.style.display = "none";
        pdfButtonContainer.style.display = "block";
    });

    editButton.addEventListener("click", function () {
        form.style.display = "block";
        pdfButtonContainer.style.display = "none";
    });

    downloadPdfButton.addEventListener("click", function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFillColor(230, 230, 250);
        doc.rect(0, 0, 210, 297, "F");

        doc.setLineWidth(2);
        doc.setDrawColor(44, 62, 80);
        doc.rect(10, 10, 190, 277);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(30, 144, 255);
        doc.text("Portfolio", 80, 30);

        if (imageDataUrl) {
            doc.addImage(imageDataUrl, 'JPEG', 140, 20, 50, 50);
        }

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Personal Information", 20, 50);
        doc.line(20, 52, 90, 52);
        doc.setFont("helvetica", "normal");

        const name = document.getElementById("name").value;
        const contact = document.getElementById("contact").value;
        const bio = document.getElementById("bio").value;

        doc.text(`Name: ${name}`, 20, 60);
        doc.text(`Contact: ${contact}`, 20, 70);
        doc.text(`Bio: ${bio}`, 20, 80);

        let yOffset = 100;
        function addSectionToPDF(title, selector) {
            doc.setFont("helvetica", "bold");
            doc.text(title, 20, yOffset);
            doc.line(20, yOffset + 2, 90, yOffset + 2);
            doc.setFont("helvetica", "normal");
            yOffset += 10;

            document.querySelectorAll(selector).forEach(entry => {
                entry.querySelectorAll("input, textarea").forEach(input => {
                    doc.text(`${input.placeholder}: ${input.value}`, 20, yOffset);
                    yOffset += 10;
                });
                yOffset += 5;
            });
        }

        addSectionToPDF("Academic Background", ".academic-entry");
        addSectionToPDF("Skills", ".skills-entry");
        addSectionToPDF("Work Experience", ".work-entry");
        addSectionToPDF("Projects/Publications", ".project-entry");

        doc.save(`${name}_portfolio.pdf`);
    });
});
