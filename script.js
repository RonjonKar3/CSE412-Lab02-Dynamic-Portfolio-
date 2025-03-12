document.getElementById('portfolioForm').addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent the form from submitting

    // Gather form data
    const name = document.getElementById('name').value;
    const contact = document.getElementById('contact').value;
    const bio = document.getElementById('bio').value;
    const image = document.getElementById('image').files[0];
    const institution = document.getElementById('institution').value;
    const degree = document.getElementById('degree').value;
    const year = document.getElementById('year').value;
    const grade = document.getElementById('grade').value;
    const softSkills = document.getElementById('softSkills').value;
    const techSkills = document.getElementById('techSkills').value;
    const company = document.getElementById('company').value;
    const duration = document.getElementById('duration').value;
    const responsibilities = document.getElementById('responsibilities').value;
    const projectTitle = document.getElementById('projectTitle').value;
    const projectDesc = document.getElementById('projectDesc').value;

    // Prepare data to send to the server
    
    // Function to handle form submission
    async function submitForm() {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('contact', contact);
        formData.append('bio', bio);
        if (image) formData.append('image', image);
        formData.append('institution', institution);
        formData.append('degree', degree);
        formData.append('year', year);
        formData.append('grade', grade);
        formData.append('softSkills', softSkills);
        formData.append('techSkills', techSkills);
        formData.append('company', company);
        formData.append('duration', duration);
        formData.append('responsibilities', responsibilities);
        formData.append('projectTitle', projectTitle);
        formData.append('projectDesc', projectDesc);

        try {
            const response = await fetch('/submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                alert('Form submitted successfully!');
                console.log('PDF URL:', result.pdfUrl);
            } else {
                alert('Error submitting form');
            }
        } catch (error) {
            console.error('Submission error:', error);
        }
    }

    submitForm(); // Call the async function
    
    // Hide the form after submission
    document.getElementById('portfolioForm').style.display = 'none';

    // Show the "Download PDF" button
    document.getElementById('pdfButtonContainer').style.display = 'block';

    // Implement the PDF generation logic (using jsPDF library)
    document.getElementById('downloadPdf').addEventListener('click', function() {
        // Use jsPDF to generate the PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Set the title and content for the PDF
        doc.setFontSize(16);
        doc.text(`Portfolio of ${name}`, 10, 10);

        doc.setFontSize(12);
        doc.text(`Name: ${name}`, 10, 20);
        doc.text(`Contact Info: ${contact}`, 10, 30);
        doc.text(`Bio: ${bio}`, 10, 40);
        doc.text(`Institution: ${institution}`, 10, 50);
        doc.text(`Degree: ${degree}`, 10, 60);
        doc.text(`Year: ${year}`, 10, 70);
        doc.text(`Grade: ${grade}`, 10, 80);
        doc.text(`Soft Skills: ${softSkills}`, 10, 90);
        doc.text(`Technical Skills: ${techSkills}`, 10, 100);
        doc.text(`Company: ${company}`, 10, 110);
        doc.text(`Job Duration: ${duration}`, 10, 120);
        doc.text(`Responsibilities: ${responsibilities}`, 10, 130);
        doc.text(`Project Title: ${projectTitle}`, 10, 140);
        doc.text(`Project Description: ${projectDesc}`, 10, 150);

        // Add image if it was uploaded
        if (image) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgData = e.target.result;
                doc.addImage(imgData, 'JPEG', 10, 160, 50, 50);
                // Save the PDF after adding image
                doc.save('portfolio.pdf');
            };
            reader.readAsDataURL(image);
        } else {
            // If no image was uploaded, just save the PDF
            doc.save('portfolio.pdf');
        }
    });
});