document.querySelector('.hamburger').addEventListener('click', function() {
    // Toggle mobile menu
    document.querySelector('.nav-links').classList.toggle('active');
    
    // Animate hamburger to "X"
    this.classList.toggle('active');
});

// Close menu when clicking a link (optional)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.remove('active');
        document.querySelector('.hamburger').classList.remove('active');
    });
});
