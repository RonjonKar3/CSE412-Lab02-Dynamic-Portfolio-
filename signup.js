document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the form from submitting the default way

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const formData = { name, email, password };

    // Send a POST request to the server to register the user
    fetch('http://localhost:5000/signup', {
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
            alert('Sign Up Successful!');
            window.location.href = 'login.html'; // Redirect to login page after successful sign-up
        } else {
            alert(data.message); // Show error message
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});
