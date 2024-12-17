function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email && password) {
        alert('Login successful!');
    } else {
        alert('Please fill in all fields.');
    }
}

function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    if (name && email && password) {
        alert('Sign Up successful!');
        // Redirect to login.html after successful sign up
        window.location.href = 'login.html';
    } else {
        alert('Please fill in all fields.');
    }
}
