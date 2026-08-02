// Palms Regalia Luxury Apartment — nav and mobile menu behavior

const API_BASE_URL = 'YOUR_BACKEND_URL_HERE'; // e.g. https://palms-regalia-backend.onrender.com

document.addEventListener('DOMContentLoaded', function () {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');

  // Nav background on scroll
  function onScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu toggle
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const isOpen = menu.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        toggle.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }
// Booking/contact form submission (Web3Forms — no backend required)
  const bookingForm = document.getElementById('bookingForm');
  const formStatus = document.getElementById('formStatus');

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      const formData = new FormData(bookingForm);
      const payload = Object.fromEntries(formData.entries());

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          formStatus.classList.remove('is-error');
          formStatus.classList.add('is-visible');
          if (data.success) {
            formStatus.classList.add('is-success');
            formStatus.textContent = "Thanks — your inquiry's been sent. We'll get back to you shortly.";
            bookingForm.reset();
          } else {
            formStatus.classList.add('is-error');
            formStatus.textContent = data.message || 'Something went wrong. Please try again or call us directly.';
          }
        })
        .catch(function () {
          formStatus.classList.add('is-visible', 'is-error');
          formStatus.textContent = 'Could not send right now. Please try again or call us directly.';
        })
        .finally(function () {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        });
    });
  }

  // Real backend reservation form (index.html #booking, booking.html)
  const reservationForm = document.getElementById('reservationForm');

  if (reservationForm) {
    const resStatus = document.getElementById('formStatus');

    reservationForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const submitBtn = reservationForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Checking availability...';
      submitBtn.disabled = true;
      resStatus.classList.remove('is-visible', 'is-success', 'is-error');

      const payload = {
        fullName: reservationForm.querySelector('#fullName').value,
        email: reservationForm.querySelector('#email').value,
        phone: reservationForm.querySelector('#phone').value,
        checkIn: reservationForm.querySelector('#bCheckin').value,
        checkOut: reservationForm.querySelector('#bCheckout').value,
        guests: parseInt(reservationForm.querySelector('#guests').value) || 1,
        message: reservationForm.querySelector('#message').value
      };

      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        resStatus.classList.add('is-visible');
        if (res.ok && data.success) {
          resStatus.classList.add('is-success');
          resStatus.textContent = `Room confirmed — Room ${data.booking.roomNumber}. We'll email you the details shortly.`;
          reservationForm.reset();
        } else if (res.status === 409) {
          resStatus.classList.add('is-error');
          resStatus.textContent = 'Sorry, no rooms are available for those dates. Try different dates.';
        } else {
          resStatus.classList.add('is-error');
          resStatus.textContent = data.error || 'Something went wrong. Please try again.';
        }
      } catch (err) {
        resStatus.classList.add('is-visible', 'is-error');
        resStatus.textContent = 'Could not reach the booking system. Please try again shortly.';
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});