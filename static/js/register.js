function validatePasswords(event) {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    event.preventDefault();
    alert("Passwords do not match. Please try again.");
  }
}
