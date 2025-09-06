// Shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ✅ ALL GLOBAL VARIABLES MUST BE DECLARED AT THE TOP
let resultSection = null;
let questions = [];
let originalQuestions = []; // 🔥 Store original order here
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
            console.log("📥 Raw data:", data);
            console.log("📊 Total questions:", data.length);
            if (Array.isArray(data)) {
                originalQuestions = JSON.parse(JSON.stringify(data)); // ✅ Deep copy
                questions = [...data];
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
    quizContainer.innerHTML = '';
    
addShuffleToggle(quizContainer);
const shuffleToggle = document.getElementById('shuffle-toggle');
if (shuffleToggle) {
    // Compare current questions with original
    const isShuffled = !arraysEqual(questions, originalQuestions);
    shuffleToggle.checked = isShuffled;
    window.shuffleCheckbox = shuffleToggle;
}


    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        q.selected = undefined;

        const questionText = document.createElement('p');
        questionText.textContent = q.question;
        questionDiv.appendChild(questionText);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';

        q.options.forEach((option, i) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.textContent = option;

            // Store question and option index in dataset
            optionDiv.dataset.questionIndex = index;
            optionDiv.dataset.optionIndex = i;

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
    createFloatingAnswerToggle();
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

    floatingBtn.addEventListener('click', () => {
        if (resultSection) {
            resultSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            setTimeout(() => {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    });

    updateFloatingButton(); // Initial update
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
                <a href="score.html" class="btn">View Scoreboard</a>
            </p>
        `;
        quizContainer.appendChild(resultSection);

        // Add toggle for showing answers
        addShowAnswersToggle(quizContainer);

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
    const formattedDate = now.toLocaleDateString();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullDate = `${formattedDate} at ${formattedTime}`;
    scores[subject] = {
        score: score,
        total: total,
        date: fullDate
    };
    localStorage.setItem('quizScores', JSON.stringify(scores));
}

// 🆕 NEW: Add toggle to show all correct answers
function addShowAnswersToggle(quizContainer) {
    const toggleDiv = document.createElement('div');
    toggleDiv.style.marginTop = '2rem';
    toggleDiv.style.textAlign = 'center';

    const label = document.createElement('label');
    label.style.fontSize = '1rem';
    label.style.marginRight = '10px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'show-answers-toggle';

    label.htmlFor = 'show-answers-toggle';
    label.textContent = 'Show All Correct Answers';

    toggleDiv.appendChild(checkbox);
    toggleDiv.appendChild(label);

    quizContainer.appendChild(toggleDiv);

    checkbox.addEventListener('change', () => {
        const showAnswers = checkbox.checked;
        showAllCorrectAnswers(showAnswers);
    });
}

// 🆕 NEW: Reveal all correct answers when toggle is checked
function showAllCorrectAnswers(show) {
    const allOptions = document.querySelectorAll('.option');

    // Remove old styles before reapplying
    allOptions.forEach(option => {
        option.classList.remove('correct', 'incorrect');
        option.style.pointerEvents = show ? 'none' : 'auto';
    });

    allOptions.forEach((option, index) => {
        const questionIndex = parseInt(option.dataset.questionIndex);
        const optionIndex = parseInt(option.dataset.optionIndex);

        const question = questions[questionIndex];
        if (!question) return;

        if (optionIndex === question.correct) {
            if (show) {
                option.classList.add('correct');
            }
        }
    });

    // Sync both toggles
    const floatingCheckbox = document.getElementById('floating-answer-checkbox');
    const bottomCheckbox = document.getElementById('show-answers-toggle');
    if (floatingCheckbox) floatingCheckbox.checked = show;
    if (bottomCheckbox) bottomCheckbox.checked = show;

    // Hide/show finish button
    const floatingBtn = document.getElementById('floating-finish-btn');
    if (floatingBtn) floatingBtn.style.display = show ? 'none' : 'block';
}

// 🆕 NEW: Create floating toggle switch
function createFloatingAnswerToggle() {
    const floatingToggle = document.getElementById('floating-answer-toggle') ||
                           document.createElement('div');

    if (!document.getElementById('floating-answer-toggle')) {
        floatingToggle.id = 'floating-answer-toggle';
        floatingToggle.style.position = 'fixed';
        floatingToggle.style.top = '20px';
floatingToggle.style.left = 'auto';
floatingToggle.style.right = '20px'; // Ensure no conflict
floatingToggle.style.bottom = 'auto';
        floatingToggle.style.zIndex = '-1000';
        floatingToggle.style.backgroundColor = '#fff';
        floatingToggle.style.border = '1px solid #ccc';
        floatingToggle.style.borderRadius = '8px';
        floatingToggle.style.padding = '10px 15px';
        floatingToggle.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        floatingToggle.style.fontFamily = 'Arial, sans-serif';
        floatingToggle.style.maxWidth = '250px';
        floatingToggle.style.textAlign = 'center';

        floatingToggle.innerHTML = `
            <label style="display:flex; align-items:center; justify-content:space-between; width:100%; font-size:14px;">
                Show Correct
                <input type="checkbox" id="floating-answer-checkbox" style="transform: scale(1.2); margin-left: 10px;">
            </label>
        `;

        document.body.appendChild(floatingToggle);

        const checkbox = floatingToggle.querySelector('#floating-answer-checkbox');
        checkbox.addEventListener('change', () => {
            showAllCorrectAnswers(checkbox.checked);
        });
    }
}

function applyShuffle(shuffle) {
    if (!originalQuestions.length) return;

    if (shuffle) {
        questions = shuffleArray(originalQuestions);
    } else {
        questions = JSON.parse(JSON.stringify(originalQuestions)); // ✅ Deep copy again
    }

    renderQuiz(); // ✅ Always re-render after change
}

function addShuffleToggle(quizContainer) {
    const toggleDiv = document.createElement('div');
    toggleDiv.style.marginTop = '2rem';
    toggleDiv.style.textAlign = 'center';

    const label = document.createElement('label');
    label.style.fontSize = '1rem';
    label.style.marginRight = '10px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'shuffle-toggle';
    checkbox.checked = false; // Default: shuffled

    label.htmlFor = 'shuffle-toggle';
    label.textContent = 'Shuffle Questions';

    toggleDiv.appendChild(checkbox);
    toggleDiv.appendChild(label);
    quizContainer.prepend(toggleDiv);

    // Save reference
    window.shuffleCheckbox = checkbox;

    checkbox.addEventListener('change', () => {
        const shouldShuffle = checkbox.checked;
        applyShuffle(shouldShuffle);
    });
}

// Helper to compare arrays deeply
function arraysEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}