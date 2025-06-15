// ✅ ALL GLOBAL VARIABLES MUST BE DECLARED AT THE TOP
let resultSection = null;
//let questions = []; // 🔥 This must come BEFORE any functions that use it


// FETCH AND QUIZ LOGIC STARTS BELOW

function loadQuiz(jsonPath) {
    console.log("🔍 loadQuiz: Loading from", jsonPath);

    fetch(jsonPath)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            console.log("✅ JSON loaded successfully");
            console.log("📥 Raw data:", data); // <-- inspect structure here
            console.log("📊 Total questions:", data.length);

            // Ensure data is an array
            if (Array.isArray(data)) {
                questions = data;
                renderQuiz();
            } else {
                console.error("❌ JSON data is not an array!");
            }
        })
        .catch(err => {
            console.error("❌ Failed to load quiz:", err);
        });
}

// Render quiz questions dynamically
function renderQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = ''; // Clear previous content

    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        q.selected = undefined; // Reset selected answers

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

    createFloatingFinishButton();
    addFinishButton(quizContainer);
}

// Create floating finish button
function createFloatingFinishButton() {
    const floatingBtn = document.getElementById('floating-finish-btn') ||
                        document.createElement('button');
    
    if (!document.getElementById('floating-finish-btn')) {
        floatingBtn.id = 'floating-finish-btn';
        floatingBtn.innerHTML = `
            Finish Quiz <span class="badge" id="answered-count">0</span>
        `;
        document.body.appendChild(floatingBtn);
    }

    // Scroll to bottom or result section
    floatingBtn.addEventListener('click', () => {
    if (resultSection) {
        console.log("🟢 Scrolling to result section");
        resultSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        console.log("🟡 Result not ready. Scrolling to bottom");

        // Wait for DOM update before scrolling
        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }
});

  //  updateFloatingButton(); // Initial update
}

// Add "Finish Quiz" button at the end
function addFinishButton(quizContainer) {
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

        saveScore(subject, correctCount, total);

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
        resultSection.scrollIntoView({ behavior: 'smooth' });

        finishButton.remove();
    });

    quizContainer.appendChild(finishButton);
}

// Function to update floating button
function updateFloatingButton() {
    let answeredCount = 0;
    questions.forEach(q => {
        if (q.selected !== undefined) answeredCount++;
    });

    const badge = document.getElementById('answered-count');
    if (badge) badge.textContent = answeredCount;

    const btn = document.getElementById('floating-finish-btn');
    if (answeredCount > 0) {
        btn.classList.add('show');
    } else {
        btn.classList.remove('show');
    }
}

// Save score to localStorage
function saveScore(subject, score, total) {
    const scores = JSON.parse(localStorage.getItem('quizScores') || '{}');
    const now = new Date();
const formattedDate = now.toLocaleDateString(); // e.g., "12/7/2025"
const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // e.g., "3:45 PM"

// Combine them
const fullDate = `${formattedDate} at ${formattedTime}`;
    scores[subject] = {
    score: score,
    total: total,
    date: fullDate
};
    localStorage.setItem('quizScores', JSON.stringify(scores));
}