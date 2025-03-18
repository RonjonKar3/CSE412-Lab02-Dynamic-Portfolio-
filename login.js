document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the form from submitting the default way

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const formData = { email, password };

    // Send a POST request to the server to check login credentials
    fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Log the response from the server
        if (data.success) {
            alert('Login successful');
            window.location.href = 'index.html'; // Redirect to homepage after login
        } else {
            alert(data.message); // Show error message
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});
