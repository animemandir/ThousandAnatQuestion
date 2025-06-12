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


// QUIZ CODE
    const quizContainer = document.getElementById('quiz-container');

    // Create floating finish button
    const floatingBtn = document.createElement('button');
    floatingBtn.id = 'floating-finish-btn';
    floatingBtn.innerHTML = `
        Finish Quiz <span class="badge" id="answered-count">0</span>
    `;
    document.body.appendChild(floatingBtn);

    let resultSection = null;

    // Render quiz questions
    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';

        const questionText = document.createElement('p');
        questionText.textContent = q.question;
        questionDiv.appendChild(questionText);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';

        q.options.forEach((option, i) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.textContent = option;

            optionDiv.addEventListener('click', () => {
                if (optionDiv.classList.contains('correct') || optionDiv.classList.contains('incorrect')) {
                    return;
                }

                const allOptions = optionsDiv.querySelectorAll('.option');
                allOptions.forEach(opt => opt.style.pointerEvents = 'none');

                if (i === q.correct) {
                    optionDiv.classList.add('correct');
                } else {
                    optionDiv.classList.add('incorrect');
                    allOptions[q.correct].classList.add('correct');
                }

                q.selected = i;

                updateFloatingButton();
            });

            optionsDiv.appendChild(optionDiv);
        });

        questionDiv.appendChild(optionsDiv);
        quizContainer.appendChild(questionDiv);
    });

    // Function to show/hide floating button based on answered questions
    function updateFloatingButton() {
        let answeredCount = 0;
        questions.forEach(q => {
            if (q.selected !== undefined) answeredCount++;
        });

        const badge = document.getElementById('answered-count');
        if (badge) badge.textContent = answeredCount;

        if (answeredCount > 0) {
            floatingBtn.classList.add('show');
        } else {
            floatingBtn.classList.remove('show');
        }
    }

    // Save score to localStorage
    function saveScore(subject, score) {
        const scores = JSON.parse(localStorage.getItem('quizScores') || '{}');
        scores[subject] = {
            score: score,
            date: new Date().toLocaleDateString()
        };
        localStorage.setItem('quizScores', JSON.stringify(scores));
    }

    // Create and append finish button
    const finishButton = document.createElement('button');
    finishButton.textContent = 'Finish Quiz';
    finishButton.className = 'btn';
    finishButton.style.marginTop = '3rem';
    finishButton.style.display = 'block';
    finishButton.style.marginLeft = 'auto';
    finishButton.style.marginRight = 'auto';

    finishButton.addEventListener('click', () => {
        let correctCount = 0;
        questions.forEach(q => {
            const selected = q.selected;
            if (selected !== undefined && selected === q.correct) {
                correctCount++;
            }
        });

        const total = questions.length;
        const subject = window.location.pathname.split('/').filter(Boolean).pop();

        saveScore(subject, correctCount);

        // Show result message
        resultSection = document.createElement('div');
        resultSection.innerHTML = `
            <h3 style="text-align:center; margin-top: 2rem;">Quiz Complete!</h3>
            <p style="text-align:center; font-size:1.2rem;">
                You got <strong>${correctCount}</strong> out of <strong>${total}</strong> correct.
            </p>
            <p style="text-align:center;">
                <a href="/score.html" class="btn">View Scoreboard</a>
            </p>
        `;
        quizContainer.appendChild(resultSection);

        // Scroll to result
        if (resultSection) {
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }

        finishButton.remove();
    });

    quizContainer.appendChild(finishButton);

    // Scroll to result when floating button is clicked
    floatingBtn.addEventListener('click', () => {
    if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }
});


// FLOATING MENU
// Get all menu from document
document.querySelectorAll('.fabTrigger').forEach(OpenMenu);
// Menu Open and Close function
function OpenMenu(active) {
  if(active.classList.contains('fabTrigger') === true){
    active.addEventListener('click', function (e) {
      e.preventDefault();        

      if (this.parentElement.classList.contains('active') === true) {
        // Close the clicked dropdown
        this.parentElement.classList.remove('active');

      } else {
        // Close the opend dropdown
        closeMenu();
        // add the open and active class(Opening the DropDown)
        this.parentElement.classList.add('active');
      }
    });
  }
};

// Close the openend Menu
function closeMenu() { 
  // remove the open and active class from other opened Moenu (Closing the opend Menu)
  document.querySelectorAll('.fab').forEach(function (container) { 
    container.classList.remove('active')
  });
}
