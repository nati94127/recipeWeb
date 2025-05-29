const searchbox = document.querySelector(".SearchBox");
const searchbtn = document.querySelector(".SearchBtn");
const tabContent = document.querySelector(".tabs-content");
const tabs = document.querySelectorAll("#tabs li");
// const recipecard = document.querySelector(".recipe-card");
const recipeCollection = document.querySelector(".recipecollection");
const toggleBtn = document.querySelector(".menu-toggle");
const navItems = document.querySelector(".nav-items");

toggleBtn.addEventListener("click", () => {
  navItems.classList.toggle("active");
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active-tab"));
    tab.classList.add("active-tab");
    const type = tab.innerText.trim().toLowerCase();
    fetchRecipe(type, ".tabs-content");
  });
});
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}
const fetchRecipe = async (query, targetSelector) => {
  const container = document.querySelector(targetSelector);
  container.innerHTML = "Fetching recipe...";
  if (recipeCollection) recipeCollection.innerHTML = "Fetching recipe...";
  const data = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?apiKey=90595c14151441ff92d3a0111e83abcb&query=${query}&includeNutrition=true&addRecipeInformation=true`
  );
  const response = await data.json();
  recipeCollection.innerHTML = "";
  container.innerHTML = "";
  if (response.results.length === 0) {
    recipeCollection.innerHTML = "<p>No recipe found</p>";
    return;
  }

  response.results.forEach((result) => {
    const recipeDiv = document.createElement("div");
    recipeDiv.classList.add("recipes");
    recipeDiv.innerHTML = `
      <img src="${result.image}">
      <div>
      <span>
      <h3>${truncateText(result.title, 30)} </h3>
      <p><i class="fa-regular fa-clock"></i> ${result.readyInMinutes} min</p>
      </span>
      <section> </section>
      </div>
      `;
    // const isSaved = (id) => {
    //   const saved = JSON.parse(localStorage.getItem("savedRecipes")) || [];
    //   return saved.some((recipe) => recipe.id === id);
    // };
    // const saveBtn = document.createElement("button");
    // saveBtn.classList.add("savbtn");

    // saveBtn.innerHTML = isSaved(result.id)
    //   ? ` <p><i class="fa-solid fa-bookmark"></i> saved </p>`
    //   : `<p><i class="fa-regular fa-bookmark"></i> save </p>`;
    // saveBtn.dataset.recipe = JSON.stringify(result);
    // saveBtn.addEventListener("click", () => {
    //   const saved = JSON.parse(localStorage.getItem("savedRecipes")) || [];
    //   if (!saved.some((item) => item.id === recipe.id)) {
    //     saved.push(recipe);
    //     localStorage.setItem("savedRecipes", JSON.stringify(saved));
    //     saveBtn.innerHTML = `<p><i class="fa-solid fa-bookmark"></i> saved </p>`;
    //     saveBtn.disabled = true;
    //   }
    // });

    const button = document.createElement("button");
    button.classList.add("btn");
    button.innerHTML = `<p><i class="fa-solid fa-utensils"></i> View Detail </p>`;
    button.addEventListener("click", () => {
      window.location.href = `recipe.html?id=${result.id}`;
    });

    recipeDiv.querySelector("section").prepend(button);
    // recipeDiv.querySelector("section").prepend(saveBtn);
    renderSaveBtn(result, recipeDiv.querySelector("section"));

    // recipeDiv.appendChild(button);
    recipeCollection.appendChild(recipeDiv);
    container.appendChild(recipeDiv);
    console.log(result);
  });
  // document.querySelectorAll(".savbtn").forEach((btn) => {
  //   btn.addEventListener("click", () => {
  //     const recipe = JSON.parse(btn.dataset.recipe);

  //     let saved = JSON.parse(localStorage.getItem("savedRecipes")) || [];

  //     if (!saved.some((item) => item.id === recipe.id)) {
  //       saved.push(recipe);
  //       localStorage.setItem("savedRecipes", JSON.stringify(saved));
  //       btn.innerHTML = `saved`;
  //     } else {
  //       btn.innerHTML == `already saved`;
  //     }
  //   });
  // });
  //console.log(response.results[0]);
};
function isSaved(id) {
  const saved = JSON.parse(localStorage.getItem("savedRecipes")) || [];
  return saved.some((item) => item.id === id);
}

function saveRecipe(recipe) {
  const saved = JSON.parse(localStorage.getItem("savedRecipes")) || [];
  if (!isSaved(recipe.id)) {
    saved.push(recipe);
    localStorage.setItem("savedRecipes", JSON.stringify(saved));
    syncAcrossTabs();
  }
}

function removeRecipe(id) {
  let saved = JSON.parse(localStorage.getItem("savedRecipes")) || [];
  saved = saved.filter((item) => item.id !== id);
  localStorage.setItem("savedRecipes", JSON.stringify(saved));
  syncAcrossTabs();
}

function syncAcrossTabs() {
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "savedRecipes",
      newValue: localStorage.getItem("savedRecipes"),
    })
  );
}

function renderSaveBtn(recipe, container) {
  const saveBtn = document.createElement("button");
  saveBtn.classList.add("savbtn");

  const updateBtnText = () => {
    saveBtn.innerHTML = isSaved(recipe.id)
      ? `<p><i class="fa-solid fa-bookmark"></i> saved </p>`
      : `<p class = "saved"><i class="fa-regular fa-bookmark"></i> save </p>`;
  };

  updateBtnText();

  saveBtn.addEventListener("click", () => {
    if (isSaved(recipe.id)) {
      removeRecipe(recipe.id);
    } else {
      saveRecipe(recipe);
    }
    updateBtnText();
  });

  container.appendChild(saveBtn);
}

searchbtn.addEventListener("click", (e) => {
  e.preventDefault();
  const searchInput = searchbox.value.trim();

  if (searchInput) {
    window.location.href = `search.html?query=${encodeURIComponent(
      searchInput
    )}`;
  }
  fetchRecipe(searchInput, ".recipecollection");
  //   console.log("u searchen");
});

searchbox.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const searchInput = searchbox.value.trim();
    if (searchInput) {
      window.location.href = `search.html?query=${encodeURIComponent(
        searchInput
      )}`;
    }
  }
  // fetchRecipe(searchInput, ".recipecollection");
  //   console.log("u searchen");
});

window.addEventListener("DOMContentLoaded", () => {
  const defaultTab = Array.from(tabs).find((tab) =>
    tab.innerText.trim().toLowerCase()
  );
  if (defaultTab) {
    defaultTab.classList.add("active-tab");
    fetchRecipe("breakfast", ".tabs-content");
  }
});
window.addEventListener("storage", (event) => {
  if (event.key === "savedRecipes") {
    updateSaveButtons();
  }
});

function updateSaveButtons() {
  const saved = JSON.parse(localStorage.getItem("savedRecipes")) || [];
  document.querySelectorAll(".recipe-card").forEach((card) => {
    const id = card.getAttribute("data-id");
    const isInSaved = saved.some((r) => r.idMeal === id);
    const saveBtn = card.querySelector("button.savbtn");

    if (saveBtn) {
      if (isInSaved) {
        saveBtn.textContent = "Saved";
        saveBtn.disabled = true;
      } else {
        saveBtn.textContent = "Save";
        saveBtn.disabled = false;
      }
    }
  });
}
window.addEventListener("pageshow", () => {
  updateSaveButtons();
});
