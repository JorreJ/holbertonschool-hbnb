/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null; // If cookie doesn't exist
}

async function findUserId(email) {
  const response = await fetch('http://127.0.0.1:5000/api/v1/users/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });
  if (response.ok) {
    const users = await response.json();
    const user = users.find(u => u.email === email);
    if (user) {
      document.cookie = `userID=${user.id}; path=/`;
      console.log(getCookie('userID'));
    }
    else {
      console.warn("user not found");
    }
  }
}

async function loginUser(email, password) {
  const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
  });
  if (response.ok) {
    const data = await response.json();
    document.cookie = `token=${data.access_token}; path=/`;
    
    await findUserId(email);
    window.location.href = 'index.html';
    
  }
  else {
    alert('Login failed: ' + response.statusText);
  }
}

function displayPlaceDetails(place) {
  const placeDetails = document.getElementsByClassName("place-info")[0];
  if (!placeDetails) return;
  placeDetails.innerHTML = "";
  document.getElementById("place-title").textContent = place.title;
  const card = document.createElement("div");

  card.innerHTML = `
    <p>${place.owner.first_name} ${place.owner.last_name}</p>
    <p>$${place.price} per night</p>
    <p>${place.description}</p>
    <p>${place.amenities}</p>`;

  placeDetails.appendChild(card);
}

async function fetchPlaceDetails(placeID, Token) {
  const headers = { "Content-Type": "application/json" };
  if (Token) {
    headers["Authorization"] = "Bearer " + Token;
  }
  const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeID}`, {
    method: "GET",
    headers: headers,
    /*credentials: "include",*/
  })
  if (response.ok) {
    const data = await response.json();
    displayPlaceDetails(data);
    await displayReviews(placeID);
  }
  else {
    console.error(
      "Error when getting places details:",
      response.statusText
    );
  }
}

function viewDetails(placeID) {
  if (!placeID) {
    console.error("No place ID provided");
    window.location.href = "index.html";
    return;
  }
  window.location.href = `place.html?id=${placeID}`;
}

function displayPlaces(places) {
  const list = document.getElementById("places-list");
  if (!list) return;
  list.innerHTML = "";

  places.forEach((place) => {
    const card = document.createElement("div");
    card.className = "place-card";
    card.setAttribute("data-price", place.price);

    let buttonHTML = "";
    buttonHTML = `<button class="button" onclick="viewDetails('${place.id}')">View Details</button>`;

    card.innerHTML = `
      <h1>${place.title}</h1>
      <p>Price: $${place.price} per night</p>
      ${buttonHTML}
    `;
    list.appendChild(card);
  });
}

async function fetchPlaces(Token) {
  const headers = { "Content-Type": "application/json" };
  if (Token) {
    headers["Authorization"] = "Bearer " + Token;
  }
  const response = await fetch("http://127.0.0.1:5000/api/v1/places/", {
    method: "GET",
    headers: headers,
  });
  if (response.ok) {
    const data = await response.json();
    displayPlaces(data);
  }
  else {
    console.error(
      "Error when getting places :",
      response.statusText
    );
  }
}

async function fetchUserById(user_id) {
  const response = await fetch(`http://127.0.0.1:5000/api/v1/users/${user_id}`, {
    method: "GET",
    headers: {
    "Content-Type": "application/json"
    }
  });
  if (response.ok) {
    return await response.json();
  }
  else {
    console.log("error in fetching user")
  }
}

async function displayReviews(placeID) {
  const response = await fetch("http://127.0.0.1:5000/api/v1/reviews/");
  if (response.ok) {
    const allReviews = await response.json();
    
    const reviews = allReviews.filter((r) => r.place_id === placeID);

    const reviewsContainer = document.getElementById("reviews");
    reviewsContainer.innerHTML = "<h1>Reviews</h1>";

    if (reviews.length === 0) {
      reviewsContainer.innerHTML += "<p>No reviews yet.</p>";
    }
    else {
      for (const r of reviews) {
        const user = await fetchUserById(r.user_id);
        const el = document.createElement("article");
        el.className = "review-card";
        el.innerHTML = `<h4>${user ? user.first_name + ' ' + user.last_name : 'Anonymous'}</h4><p>"${r.text}"</p><p>Rating: ${r.rating}/5</p>`;
        reviewsContainer.appendChild(el);
      }
    }
  }
  else {
    console.log('there is a problem')
  }
}

async function sendReview(review, rating, placeID, Token) {
  const userID = getCookie('userID');
  const response = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + Token,
    },
    body: JSON.stringify({
      text: review,
      rating: parseInt(rating),
      user_id: userID,
      place_id: placeID,
    })
  });
  if (response.ok) {
    alert("Review submitted successfully");
    document.getElementById("review-form").reset();
  }
  else {
    alert('Review submission failed: ' + response.statusText);
  }
}

document.addEventListener('DOMContentLoaded', () => {

  const Token = getCookie('token');
  const logoutLink = document.getElementById('logout-link');

  if (logoutLink) {
    logoutLink.addEventListener('click', (event) => {
      event.preventDefault();

      document.cookie = 'token=; Max-Age=0; path=/';
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  }

  if (window.location.pathname.includes('login.html')) {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        await loginUser(email, password);
      });
    };
  }
  
  if (window.location.pathname.includes('index.html')) {

    fetchPlaces(Token);

    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
      priceFilter.addEventListener('change', (event) => {
        const selectedPrice = event.target.value;
        const placeCards = document.querySelectorAll(".place-card");
        placeCards.forEach((card) => {
          const price = parseFloat(card.getAttribute("data-price"));
          if (selectedPrice === "All") {
            card.style.display = "block";
          } else {
            const maxPrice = parseFloat(selectedPrice);
            card.style.display = price <= maxPrice ? "block" : "none";
          }
        });
      });
    }
  }

  if (window.location.pathname.includes('place.html')) {
    const params = new URLSearchParams(window.location.search);
    const placeID = params.get('id');
    if (placeID) {
      sessionStorage.setItem('placeID', placeID);
      fetchPlaceDetails(placeID, Token);
    } else {
      console.error('No ID found in URL');
    }
  }

  if (window.location.pathname.includes('add_review.html')) {
    const placeID = sessionStorage.getItem('placeID');
    if (!Token || !placeID) {
      window.location.href = "index.html"
    }
    const reviewForm = document.getElementById("review-form");
    if (reviewForm) {
      reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const review = document.getElementById('review').value;
        const rating = document.getElementById('rating').value;

        await sendReview(review, rating, placeID, Token);
      })
    }
  }

  if (Token) {
    document.getElementById('login-link').style.display = 'none';
    document.getElementById('logout-link').style.display = 'inline';
    document.getElementById('private-content').style.display = 'inline';
  }
  else {
    document.getElementById('login-link').style.display = 'inline';
    document.getElementById('logout-link').style.display = 'none';
    document.getElementById('private-content').style.display = 'none';
  }
});
