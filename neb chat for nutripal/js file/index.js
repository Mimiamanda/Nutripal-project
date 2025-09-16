let current = "splash";
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function goTo(id){
  document.getElementById(current)?.classList.remove("active");
  document.getElementById(id)?.classList.add("active");
  current = id;
}

// Splash → pre-splash auto sequence; stop on pre3
window.addEventListener("load", () => {
   setTimeout(() => {
    splash.classList.add("fade-out");
  }, 3000)
  setTimeout(()=> goTo("pre1"), 3800);
  setTimeout(()=> goTo("pre2"), 6800);
  setTimeout(()=> goTo("pre3"), 9800);
});

// Get Started → Sign up
$("#getStartedBtn").addEventListener("click", () => goTo("signup"));

// Sign up choices
$("#emailStart").addEventListener("click", () => goTo("emailAuth"));
$("#googleStart").addEventListener("click", () => goTo("verify"));

// Email auth → Verify
$("#emailSubmit").addEventListener("click", () => goTo("verify"));

// === Forgot Password & Sign up from Login ===

// Go to Forgot Password
$("#forgotPasswordLink").addEventListener("click", (e) => {
  e.preventDefault();
  goTo("forgotPassword");
});

// Submit reset password
$("#resetSubmit").addEventListener("click", () => {
  const resetEmail = $("#resetEmail").value.trim();
  if (!resetEmail) {
    alert("Please enter your email");
    return;
  }
  alert(`Password reset link sent to ${resetEmail}`);
  goTo("emailAuth"); // after sending, return to login
});

// Go to Sign Up from login footer
$("#goToSignup").addEventListener("click", (e) => {
  e.preventDefault();
  goTo("signup");
});

// OTP behaviour (rounded square boxes)
(function otpSetup(){
  const inputs = $$("#otp .otp-input");
  const verifyBtn = $("#verifyBtn");

  inputs.forEach((input, idx) => {
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0,1); // keep 1 digit
      if(e.target.value && idx < inputs.length - 1){
        inputs[idx+1].focus();
      }
      if(inputs.every(i => i.value.length === 1)){
        // Auto-continue after a tiny delay to feel snappy
        setTimeout(()=> goTo("verified"), 300);
      }
    });

    input.addEventListener("keydown", (e) => {
      if(e.key === "Backspace" && !e.target.value && idx > 0){
        inputs[idx-1].focus();
      }
      if(e.key === "ArrowLeft" && idx > 0) inputs[idx-1].focus();
      if(e.key === "ArrowRight" && idx < inputs.length-1) inputs[idx+1].focus();
    });
  });

  // === Verify screen extras: Resend timer + Change email ===
(function verifyExtras(){
  const resendBtn = document.getElementById('resendBtn');
  const changeBtn = document.getElementById('changeEmailBtn');
  const verifySection = document.getElementById('verify');
  const RESEND_COOLDOWN = 30; // seconds
  let timerId = null;

  function startResendTimer(seconds = RESEND_COOLDOWN){
    if (!resendBtn) return;
    if (timerId) return; // already running
    resendBtn.disabled = true;
    let remaining = seconds;
    resendBtn.textContent = `Resend code (${remaining}s)`;
    timerId = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(timerId);
        timerId = null;
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend code';
      } else {
        resendBtn.textContent = `Resend code (${remaining}s)`;
      }
    }, 1000);
  }

  // When user clicks resend -> call API (replace alert with fetch in real app)
  if (resendBtn) {
    resendBtn.addEventListener('click', () => {
      // TODO: wire your resend verification endpoint here (fetch/post)
      // Example: fetch('/api/auth/resend', { method:'POST', body: JSON.stringify({ email }) })
      alert('A new verification code has been sent to your email.'); // demo
      startResendTimer();
    });
  }

  // Change email button: clear OTP inputs and navigate back to email screen
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      // clear OTP inputs
      const inputs = document.querySelectorAll('#otp .otp-input');
      inputs.forEach(i => i.value = '');

      // navigate back to email auth screen (uses your existing goTo function)
      if (typeof goTo === 'function') {
        goTo('emailAuth');
        // focus email input shortly after transition
        setTimeout(() => {
          const emailInput = document.getElementById('email');
          if (emailInput) emailInput.focus();
        }, 250);
      } else {
        // fallback - reload so user can see email field
        location.reload();
      }
    });
  }

  // Auto-start cooldown when verify screen becomes active (mutation observer)
  if (verifySection) {
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'class') {
          const cls = verifySection.className;
          if (cls.includes('active')) {
            // start timer only if not already running
            startResendTimer();
          }
        }
      }
    });
    mo.observe(verifySection, { attributes: true });
    // If page loaded and verify already active, start immediately
    if (verifySection.classList.contains('active')) startResendTimer();
  }
})();

function updateDots(screenId) {
  const dots = document.querySelectorAll('.dots .dot');
  if (!dots.length) return;
  
  let index = 0;
  if (screenId === "pre1") index = 0;
  else if (screenId === "pre2") index = 1;
  else if (screenId === "pre3") index = 2;

  dots.forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

// click handler for login / sign up on pre-splash screens
document.addEventListener('click', (e) => {
  // Login button -> email auth (login)
  if (e.target.closest && e.target.closest('.loginBtn')) {
    // If you want to indicate "login" mode to the email screen, set a global flag
    window.authMode = 'login';
    goTo('emailAuth');
    setTimeout(() => document.getElementById('email')?.focus(), 250);
  }

  // Sign up button -> signup flow
  if (e.target.closest && e.target.closest('.signupBtn')) {
    window.authMode = 'signup';
    goTo('signup');
  }


});


// Call inside goTo()
function goTo(id) {
  document.getElementById(current)?.classList.remove("active");
  document.getElementById(id)?.classList.add("active");
  current = id;
  updateDots(id); // NEW
}


  // Paste support
  $("#otp").addEventListener("paste", (e) => {
    const data = (e.clipboardData.getData("text") || "").replace(/\D/g,"").slice(0,4);
    if(!data) return;
    e.preventDefault();
    inputs.forEach((inp, i) => inp.value = data[i] || "");
    if(inputs.every(i => i.value)) setTimeout(()=> goTo("verified"), 250);
  });

  // Optional manual confirm
  verifyBtn.addEventListener("click", () => {
    if(inputs.every(i => i.value)) goTo("verified");
  });
})();

// Verified → Gender
$("#proceed").addEventListener("click", () => goTo("gender"));

// Gender → You
$$('#gender .btn').forEach(btn => {
  btn.addEventListener('click', () => goTo(btn.dataset.next));
});

// You → Goals
$("#toGoals").addEventListener("click", () => goTo("goals"));

// Goals branching logic
$("#goalsNext").addEventListener("click", () => {
  const checked = $$("#goalList input:checked").map(i => i.value);
  if(checked.length < 4){
    alert("Please pick at least four goals to continue.");
    return;
  }
  if(checked.includes("plan-meals") || checked.includes("track-calories")){
    goTo("plannerA");
  } else {
    goTo("plannerB");
  }
});



// Planner B answers (demo)
$("#needHelp").addEventListener("click", () => goTo("plannerA"));
$("#noThanks").addEventListener("click", () => alert("Awesome — you can enable planning later in Settings!"));


// Handle navigation from PlannerA -> MealFrequency
$("#plannerANext").addEventListener("click", () => {
  goTo("mealFrequency");
});


// Meal frequency selection
const optionButtons = document.querySelectorAll("#mealOptions .option-btn");
const mealNextBtn = document.getElementById("mealNext");
let selectedMealOption = null;

optionButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // Reset previous selection
    optionButtons.forEach(b => b.classList.remove("active"));
    // Mark new selection
    btn.classList.add("active");
    selectedMealOption = btn.dataset.value;
    mealNextBtn.removeAttribute("disabled");
  });
});

mealNextBtn.addEventListener("click", () => {
  if (selectedMealOption) {
    console.log("User selected meal frequency:", selectedMealOption);
    goTo("smartPlanner"); // ✅ go to Smart Planner screen
  }
});

// Smart Planner → PlannerB
$("#smartPlannerNext").addEventListener("click", () => {
  goTo("plannerB");
});



// PlannerB answers
$("#needHelp").addEventListener("click", () => {
  goTo("activityLevel"); // instead of plannerA
});

$("#noThanks").addEventListener("click", () => {
  alert("Awesome — you can enable planning later in Settings!");
});

// Activity Level selection
const activityButtons = document.querySelectorAll("#activityOptions .option-btn");
const activityNextBtn = document.getElementById("activityNext");
let selectedActivity = null;

activityButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    activityButtons.forEach(b => b.classList.remove("active")); // reset
    btn.classList.add("active");
    selectedActivity = btn.dataset.value;
    activityNextBtn.removeAttribute("disabled");
  });
});

activityNextBtn.addEventListener("click", () => {
  if (selectedActivity) {
    console.log("User activity level:", selectedActivity);
    // 🔜 Replace with next screen ID in your flow
    goTo("goals"); 
  }
});

// Activity Level → Meals per Day
const mealsButtons = document.querySelectorAll("#mealsOptions .option-btn");
const mealsNextBtn = document.getElementById("mealsNext");
let selectedMeals = null;

mealsButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    mealsButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMeals = btn.dataset.value;
    mealsNextBtn.removeAttribute("disabled");
  });
});

$("#activityNext").addEventListener("click", () => {
  if (selectedActivity) goTo("mealsPerDay");
});

mealsNextBtn.addEventListener("click", () => {
  if (selectedMeals) goTo("snacking");
});

// Snacking → Good habits
const snackButtons = document.querySelectorAll("#snackOptions .option-btn");
const snackNextBtn = document.getElementById("snackNext");
let selectedSnack = null;

snackButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    snackButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedSnack = btn.dataset.value;
    snackNextBtn.removeAttribute("disabled");
  });
});

snackNextBtn.addEventListener("click", () => {
  if (selectedSnack) goTo("goodHabits");
});

// Good habits → (conditional) next step
const habitButtons = document.querySelectorAll("#habitOptions .option-btn");
const habitNextBtn = document.getElementById("habitNext");
let selectedHabit = null;

habitButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    habitButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedHabit = btn.dataset.value;
    habitNextBtn.removeAttribute("disabled");
  });
});

habitNextBtn.addEventListener("click", () => {
  if (selectedHabit === "yes" || selectedHabit === "sometimes") {
    goTo("causes");
  } else {
    goTo("reminders");
  }
});

// Causes → Reminders
const causeButtons = document.querySelectorAll("#causeOptions .option-btn");
const causeNextBtn = document.getElementById("causeNext");
let selectedCause = null;

causeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    causeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCause = btn.dataset.value;
    causeNextBtn.removeAttribute("disabled");
  });
});

causeNextBtn.addEventListener("click", () => {
  if (selectedCause) goTo("reminders");
});

// Reminders → (end of flow for now)
// $("#reminderYes").addEventListener("click", () => {
//   alert("Great! We'll send you reminders.");
// });
// $("#reminderNo").addEventListener("click", () => {
//   alert("Okay, no reminders for now.");
// });

// ---------- Back buttons (generic) ----------
document.addEventListener('click', (e) => {
  const back = e.target.closest && e.target.closest('.back-btn');
  if (back) {
    const target = back.dataset.back;
    if (target) goTo(target);
  }
});

// ---------- Reminders branching (replace the earlier tiny alerts) ----------
const reminderYesBtn = document.getElementById('reminderYes');
const reminderNoBtn = document.getElementById('reminderNo');
if (reminderYesBtn) reminderYesBtn.addEventListener('click', () => goTo('accountCreate'));
if (reminderNoBtn) reminderNoBtn.addEventListener('click', () => goTo('dashboard'));

// ---------- Account creation flow ----------
const acctCreateNext = document.getElementById('acctCreateNext');
if (acctCreateNext) {
  acctCreateNext.addEventListener('click', () => {
    const email = (document.getElementById('accountEmail') || {}).value || '';
    if (!email || !/.+@.+\..+/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    // Optionally show the email on the next screen or save to localStorage
    const createdTitle = document.querySelector('#accountCreated .sub');
    if (createdTitle) createdTitle.textContent = `Welcome aboard, ${email.split('@')[0]}.`;
    goTo('accountCreated');
  });
}

const acctCreatedNext = document.getElementById('acctCreatedNext');
if (acctCreatedNext) acctCreatedNext.addEventListener('click', () => goTo('dashboard'));


// Fill user name on dashboard
const userName = document.getElementById('userName');
if (userName) {
  const email = localStorage.getItem('userEmail') || 'Joy@example.com';
  userName.textContent = email.split('@')[0];
}

// Bottom nav routing
document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    goTo(btn.dataset.screen);
  });
});

// Workout plan options → details
const workoutPlans = {
  hiit: [
    "Jumping Jacks - 30s",
    "Rest - 10s",
    "Mountain Climbers - 30s",
    "Rest - 10s",
    "Squat Jumps - 30s",
    "Rest - 10s",
    "Push-Ups - 30s"
  ],
  full: ["Push-ups - 3x10", "Lunges - 3x12", "Plank - 3x40s"],
  core: ["Crunches - 3x15", "Bicycle Kicks - 3x20", "Leg Raises - 3x12"],
  cardio: ["Burpees - 3x10", "Running - 20 min", "Jump Rope - 5 min"],
  flex: ["Yoga Flow - 15 min", "Stretching - 10 min"]
};

document.querySelectorAll('#workout .option-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const plan = btn.dataset.plan;
    const title = btn.textContent;
    document.getElementById('workoutTitle').textContent = title;
    
    const list = document.getElementById('exerciseList');
    list.innerHTML = "";
    workoutPlans[plan].forEach(ex => {
      const li = document.createElement('li');
      li.textContent = ex;
      list.appendChild(li);
    });
    
    goTo('workoutDetail');
  });
});

// ---- Utility: first name from email ----
function getFirstNameFromEmail(email) {
  if (!email) return 'Joy';
  const local = email.split('@')[0] || email;
  // pick the first meaningful token (split . _ -)
  const first = local.split(/[\._\- ]+/)[0] || local;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

// ---- save email when account is created (enhance your existing handler) ----
(function wireAccountCreatedSave() {
  const acctCreateNext = document.getElementById('acctCreateNext');
  if (!acctCreateNext) return;
  acctCreateNext.addEventListener('click', () => {
    const emailInput = document.getElementById('accountEmail');
    const email = (emailInput && emailInput.value) ? emailInput.value.trim() : '';
    if (!email || !/.+@.+\..+/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    // persist for later usage
    localStorage.setItem('userEmail', email);
    // optional: set a placeholder profile (real app: upload/profile fetch)
    if (!localStorage.getItem('profilePic')) {
      localStorage.setItem('profilePic', 'https://via.placeholder.com/160');
    }
    // call goTo to move forward (your goTo already exists)
    if (typeof goTo === 'function') {
      goTo('accountCreated');
      // after a tiny delay, navigate into dashboard
      setTimeout(() => { goTo('dashboard'); }, 3500);
    } else {
      // fallback behavior
      location.href = '#dashboard';
    }
  });
})();



// Show dashboard when "Next" is clicked
document.getElementById("acctCreatedNext").addEventListener("click", () => {
  document.getElementById("accountCreated").classList.remove("active");
  document.getElementById("dash-dashboard").classList.add("active");
});

// Optional: go back to accountCreated if needed
document.getElementById("acctCreatedBack").addEventListener("click", () => {
  document.getElementById("dash-dashboard").classList.remove("active");
  document.getElementById("accountCreated").classList.add("active");
});

// Open Workout Setup when Start Workout clicked
document.querySelectorAll(".dash-card .dash-btn").forEach(btn => {
  if (btn.textContent.includes("Start Workout")) {
    btn.addEventListener("click", () => {
      document.getElementById("dash-dashboard").classList.remove("active");
      document.getElementById("dash-workout-setup").classList.add("active");
    });
  }
});

// Back button to dashboard
document.getElementById("workoutBack").addEventListener("click", () => {
  document.getElementById("dash-workout-setup").classList.remove("active");
  document.getElementById("dash-dashboard").classList.add("active");
});

// Handle workout form submission
document.getElementById("workoutForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("workoutName").value;
  const time = document.getElementById("workoutTime").value;
  const days = Array.from(document.querySelectorAll(".dash-days input:checked"))
                   .map(c => c.value)
                   .join(", ");

  alert(`Workout Saved!\nName: ${name}\nTime: ${time}\nDays: ${days}`);

  // Optional: Generate Google Calendar link
  const startDate = new Date();
  const [hour, minute] = time.split(":");
  startDate.setHours(hour, minute);

  const endDate = new Date(startDate.getTime() + 30*60000); // default 30 mins

  const formatDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const calUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(name)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=Workout+Reminder&recur=RRULE:FREQ=WEEKLY`;

  window.open(calUrl, "_blank");
});




