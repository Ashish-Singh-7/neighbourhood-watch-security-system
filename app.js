const validUsername='admin';
const validPassword='password123';

document.getElementById('loginForm').addEventListener('submit',function(event){
    event.preventDefault();

    const username=document.getElementById('username').value;
    const password=document.getElementById('password').value;
    const errorMessage=document.getElementById('error-message');
    if(username==validUsername && password==validPassword){
        errorMessage.textContent='';
        alert('Login Successful! Welcome to the home page.');
        window.location.href="home.html";
    }
    else{
        errorMessage.textContent='Invalid username or password. Please try again.';
    }
});