(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = $('.toast');
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch { }
  }
  function safeStorageRemove(key) {
    try { localStorage.removeItem(key); } catch { }
  }

  function initNavigation() {
    const button = $('.menu-button');
    const nav = $('.primary-nav');
    if (!button || !nav) return;
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    $$('a', nav).forEach((link) => link.addEventListener('click', () => {
      button.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }));
  }

  function initReveal() {
    const items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
  }

  function initPhotos() {
    $$('img[data-photo]').forEach((image) => {
      const showFallback = () => {
        const shell = image.closest('.photo-shell') || image.parentElement;
        if (shell) shell.classList.add('is-fallback');
        image.remove();
      };
      image.addEventListener('error', showFallback, { once: true });
      if (image.complete && image.naturalWidth === 0) showFallback();
    });
  }

  function initDemoActions() {
    $$('[data-demo]').forEach((element) => element.addEventListener('click', (event) => {
      if (element.tagName === 'A' && element.getAttribute('href') === '#') event.preventDefault();
      showToast(element.dataset.demo || 'This action is represented for prototype review.');
    }));

    $$('[data-reset-profile]').forEach((button) => button.addEventListener('click', () => {
      ['efV6Interest', 'efV6Profile', 'efV6Audience'].forEach(safeStorageRemove);
      showToast('Demo choices reset.');
    }));
  }

  function initExplore() {
    if (document.body.dataset.page !== 'explore') return;
    const form = $('#smart-search');
    const input = $('#trip-prompt');
    const title = $('[data-results-title]');
    const summary = $('[data-results-summary]');
    const grid = $('#trip-grid');
    const audienceButtons = $$('[data-audience]');
    if (!form || !input || !title || !summary || !grid) return;

    const profiles = {
      culture: {
        title: 'Trips for food, history, and confidence.',
        summary: 'Recommendations shaped around what you want to experience and become.',
        order: ['lpr', 'ig', 'japan', 'gas', 'costa', 'peru'],
        copy: {
          student: {
            lpr: 'Three iconic cities with art, food, and enough structure to make a first big trip feel doable.',
            ig: 'History becomes real when you move from ruins and museums into the streets and meals around them.',
            japan: 'A vivid mix of design, food, tradition, and technology—with a lot to notice beyond the famous sights.',
            gas: 'A good fit if you want city energy, mountain scenery, and a trip that builds confidence without feeling chaotic.',
            costa: 'Great if you want food, nature, and communities to show how culture and environment shape each other.',
            peru: 'A powerful mix of landscape, living culture, and history you can understand by standing inside it.'
          },
          parent: {
            lpr: 'A well-supported first international trip with strong academic relevance, recognizable landmarks, and clear day-to-day structure.',
            ig: 'Students experience major historic sites while practicing observation, discussion, and cross-cultural awareness in guided settings.',
            japan: 'A highly structured experience that builds cultural awareness and independence across distinctly different settings.',
            gas: 'Balances culture and outdoor experiences while giving students room to grow more independent in a supported group environment.',
            costa: 'Active learning, environmental context, and organized group support make the value of each day easy to understand.',
            peru: 'Combines important historical learning with cultural exchange and guided travel through extraordinary landscapes.'
          },
          educator: {
            lpr: 'Strong for history, art, and civics, with three distinct cities that make comparison and post-trip classroom work easy to build.',
            ig: 'High-value itinerary for classical history, world history, and culture, with clear links between ancient sites and modern life.',
            japan: 'Strong for comparative culture, design, language, and global studies, with rich opportunities for observation and reflection.',
            gas: 'Useful for interdisciplinary learning that combines geography, culture, and identity with manageable pacing for a group.',
            costa: 'A natural fit for science, sustainability, Spanish, and place-based learning through direct field observation.',
            peru: 'Excellent for history, geography, culture, and environmental learning, with strong opportunities for inquiry and evidence.'
          }
        }
      },
      nature: {
        title: 'Trips for nature, challenge, and confidence.',
        summary: 'Recommendations shaped around outdoor learning, movement, and places that push students a little.',
        order: ['costa', 'peru', 'gas', 'japan', 'lpr', 'ig'],
        copy: {
          student: {
            costa: 'Rainforests, wildlife, and active days make the environment feel like something you explore—not just study.',
            peru: 'Big landscapes and living history make this feel adventurous, meaningful, and unlike a normal school week.',
            gas: 'You get major scenery, active days, and a trip that feels adventurous without losing the city experiences.',
            japan: 'A strong match if you want contrast—from dense cities to mountains, gardens, and quieter traditions.',
            lpr: 'Still a good fit if you want variety and a structured first trip where every day feels different.',
            ig: 'A good choice if you want history with more walking, movement, and discovery built into the route.'
          },
          parent: {
            costa: 'Combines field-based learning, active experiences, and organized support in a clear, purposeful itinerary.',
            peru: 'Students take on meaningful challenges while learning with guides and traveling in a structured group.',
            gas: 'Combines outdoor beauty with organized group travel and visible personal-growth moments for first-time travelers.',
            japan: 'Offers cultural and geographic variety while maintaining strong structure, support, and guided learning.',
            lpr: 'A balanced option that builds confidence through structure, familiar landmarks, and guided movement through major cities.',
            ig: 'A more immersive route that rewards curiosity and stamina while remaining strongly supported for group travel.'
          },
          educator: {
            costa: 'Ideal for biology, ecology, sustainability, and Spanish through direct observation and guided field experiences.',
            peru: 'Connects geography, environmental systems, and history in a route that makes place central to the learning.',
            gas: 'Ideal for connecting geography, environmental observation, and culture in a trip that mixes city and landscape.',
            japan: 'Supports comparative study of urban systems, natural spaces, design, and culture across varied settings.',
            lpr: 'A flexible option for broader learning goals when you want strong support and a destination set students already recognize.',
            ig: 'Best for inquiry-led trips where walking through place is part of the learning rather than only reaching the landmark.'
          }
        }
      },
      language: {
        title: 'Trips for language, culture, and everyday connection.',
        summary: 'Recommendations shaped around hearing another language, noticing local routines, and learning through everyday life.',
        order: ['costa', 'lpr', 'peru', 'japan', 'gas', 'ig'],
        copy: {
          student: {
            costa: 'A welcoming place to hear and practice Spanish while learning through food, nature, and everyday interactions.',
            lpr: 'You hear different languages, notice daily routines, and still get the iconic moments that make a first trip exciting.',
            peru: 'Spanish, Indigenous culture, markets, and daily life give you many ways to connect language to place.',
            japan: 'Even small interactions reveal how language, etiquette, and culture work together in daily life.',
            gas: 'A strong choice if you want to compare cultures, city life, and local traditions across multiple countries.',
            ig: 'Great if you want food, conversation, and ancient places that still feel part of everyday life.'
          },
          parent: {
            costa: 'Students gain practical language confidence and cultural awareness within a supported group experience.',
            lpr: 'Students gain cultural exposure and communication confidence while traveling in a highly structured, familiar route.',
            peru: 'Combines language exposure with guided cultural and historical learning in a purposeful itinerary.',
            japan: 'Builds cultural awareness and communication confidence through observation, etiquette, and supported interaction.',
            gas: 'Offers broad cultural contrast and practical travel experience while preserving strong group support.',
            ig: 'Supports deeper cultural understanding through daily observation, major sites, and guided group reflection.'
          },
          educator: {
            costa: 'Useful for Spanish and cultural study, with repeated openings for observation, interaction, and reflection.',
            lpr: 'Useful for language, culture, and social studies, especially when students compare how different cities live and communicate.',
            peru: 'Strong for Spanish, history, and cultural study, with meaningful connections between language and community life.',
            japan: 'A rich choice for language, etiquette, cultural comparison, and global studies across urban and traditional settings.',
            gas: 'A comparative route that helps students notice how place, language, and identity shift across borders.',
            ig: 'Great for making culture feel lived-in rather than abstract, with clear openings for writing and discussion afterward.'
          }
        }
      },
      history: {
        title: 'Trips where history becomes something students can test.',
        summary: 'Recommendations shaped around major historic sites, visible evidence, and strong classroom connections.',
        order: ['ig', 'lpr', 'peru', 'japan', 'gas', 'costa'],
        copy: {
          student: {
            ig: 'If you want history to stop feeling like a chapter, every site gives you something concrete to notice and question.',
            lpr: 'Three cities make it easy to compare power, art, and public life while still feeling accessible for a first trip.',
            peru: 'The landscape, architecture, and living culture make history feel connected rather than sealed in the past.',
            japan: 'You can see how tradition and modern life coexist instead of treating history as something that ended.',
            gas: 'A strong option when you want history with broader cultural context and a different pace from the classic capitals.',
            costa: 'Best when you want to connect environmental history, agriculture, and community choices to the country you see today.'
          },
          parent: {
            ig: 'Major sites, guided context, and strong educational value make this especially compelling for students interested in history.',
            lpr: 'Students experience some of Europe’s most recognizable landmarks in a route that balances learning with first-trip manageability.',
            peru: 'Students explore major historical ideas through place while traveling with clear structure and support.',
            japan: 'A thoughtful route for understanding how history shapes identity, design, and everyday behavior today.',
            gas: 'Offers strong cultural and historical learning while supporting student growth through new settings and varied experiences.',
            costa: 'Connects history to environment and community in a guided experience that makes abstract topics more concrete.'
          },
          educator: {
            ig: 'Excellent for history instruction, with rich opportunities for observation, comparison, and post-trip analysis.',
            lpr: 'A high-utility route for history, civics, and art that supports side-by-side comparison across three capitals.',
            peru: 'Strong for evidence-based study of empire, geography, Indigenous culture, and historical continuity.',
            japan: 'Useful for studying modernization, tradition, conflict, identity, and how history remains visible in current life.',
            gas: 'A useful alternative for broader European history and identity, especially when you want a less conventional mix of locations.',
            costa: 'Supports environmental history and cultural geography, with place-based evidence students can use after the trip.'
          }
        }
      }
    };

    let currentProfile = safeStorageGet('efV6Profile') || 'culture';
    let currentAudience = safeStorageGet('efV6Audience') || 'student';

    function chooseProfile(text) {
      const value = text.toLowerCase();
      if (/(wild|nature|animal|rainforest|outdoor|adventure|challenge|science|eco|alps|mountain)/.test(value)) return 'nature';
      if (/(language|spanish|french|italian|japanese|culture|people|everyday)/.test(value) && !/(art|history|museum)/.test(value)) return 'language';
      if (/(history|ancient|government|war|empire|politic|civic|museum)/.test(value) && !/(food|art)/.test(value)) return 'history';
      return 'culture';
    }

    function renderAudience(audience) {
      currentAudience = audience;
      safeStorageSet('efV6Audience', audience);
      audienceButtons.forEach((button) => {
        const active = button.dataset.audience === audience;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', String(active));
      });
      const profile = profiles[currentProfile];
      profile.order.forEach((id) => {
        const card = $(`[data-trip="${id}"]`, grid);
        const why = $('[data-why]', card);
        if (why) why.textContent = profile.copy[audience][id];
      });
    }

    function applyMatches(text, shouldScroll = true) {
      currentProfile = chooseProfile(text);
      const profile = profiles[currentProfile];
      safeStorageSet('efV6Interest', text.trim());
      safeStorageSet('efV6Profile', currentProfile);
      title.textContent = profile.title;
      summary.textContent = profile.summary;

      profile.order.forEach((id, index) => {
        const card = $(`[data-trip="${id}"]`, grid);
        if (!card) return;
        grid.appendChild(card);
        const badge = $('.match-badge', card);
        if (badge) badge.textContent = index === 0 ? 'Best match' : index === 1 ? 'Strong match' : index === 2 ? 'Good match' : 'Worth a look';
        if (card.animate) card.animate(
          [{ opacity: 0.25, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 340, delay: index * 45, easing: 'ease-out' }
        );
      });

      renderAudience(currentAudience);
      if (shouldScroll) {
        $('#results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast('Six trips matched to what you described.');
      }
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (value.length < 8) {
        showToast('Add a little more about what you want to experience.');
        input.focus();
        return;
      }
      applyMatches(value, true);
    });

    $$('[data-prompt]').forEach((button) => button.addEventListener('click', () => {
      input.value = button.dataset.prompt;
      input.focus();
    }));

    audienceButtons.forEach((button) => button.addEventListener('click', () => renderAudience(button.dataset.audience)));

    $$('.save-heart').forEach((button) => button.addEventListener('click', () => {
      const saved = button.getAttribute('aria-pressed') === 'true';
      button.setAttribute('aria-pressed', String(!saved));
      button.textContent = saved ? '♡' : '♥';
      showToast(saved ? 'Removed from your shortlist.' : 'Saved to your shortlist.');
    }));

    $$('.audio-play').forEach((button) => button.addEventListener('click', () => {
      const wasPlaying = button.classList.contains('is-playing');
      $$('.audio-play').forEach((item) => { item.classList.remove('is-playing'); item.querySelector('span').textContent = '▶'; });
      if (!wasPlaying) {
        button.classList.add('is-playing');
        button.querySelector('span').textContent = 'Ⅱ';
        showToast(`Playing ${button.dataset.audioName}’s illustrative ${button.dataset.audioRole || 'traveler'} perspective.`);
        setTimeout(() => {
          button.classList.remove('is-playing');
          button.querySelector('span').textContent = '▶';
        }, 3200);
      }
    }));

    const savedQuery = safeStorageGet('efV6Interest');
    if (savedQuery) {
      input.value = savedQuery;
      applyMatches(savedQuery, false);
    } else {
      applyMatches(input.value, false);
    }
  }

  function initTrip() {
    if (document.body.dataset.page !== 'trip') return;
    const planData = {
      history: {
        label: 'History & civics plan',
        title: 'How cities show power',
        before: 'Compare one modern public space with Westminster. What does its design ask people to notice?',
        during: 'Photograph or sketch evidence of how power is represented in London, Paris, and Rome.',
        after: 'Create a five-slide argument: “What can a city teach us about who held power?”'
      },
      art: {
        label: 'Art & design plan',
        title: 'How place changes what art communicates',
        before: 'Choose one artwork or building from each city and note its audience, material, and original purpose.',
        during: 'Record scale, setting, texture, and one detail that was difficult to see on a screen.',
        after: 'Create a visual comparison explaining how seeing work in place changed your interpretation.'
      },
      language: {
        label: 'World language plan',
        title: 'Using language in everyday situations',
        before: 'Prepare practical phrases for greetings, ordering, directions, and asking one follow-up question.',
        during: 'Use the language in one supported daily interaction and note what helped the conversation work.',
        after: 'Record a short spoken reflection describing what you said, understood, and would try next.'
      },
      literature: {
        label: 'Literature plan',
        title: 'How setting shapes a story',
        before: 'Read a short text connected to London, Paris, or Rome and identify how setting affects tone or character.',
        during: 'Capture sensory details, overheard language, and one place that challenged the version you imagined.',
        after: 'Write a scene or short analysis using firsthand details from the trip as evidence.'
      }
    };

    $('#build-plan')?.addEventListener('click', () => {
      const subject = $('#subject-select')?.value || 'history';
      const plan = planData[subject];
      const label = $('.learning-plan .eyebrow');
      if (label) label.textContent = plan.label;
      $('#plan-title').textContent = plan.title;
      $('#plan-before').textContent = plan.before;
      $('#plan-during').textContent = plan.during;
      $('#plan-after').textContent = plan.after;
      $('.learning-plan')?.animate?.(
        [{ opacity: .55, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 280, easing: 'ease-out' }
      );
      showToast('The learning plan was updated.');
    });
  }

  function initDashboard() {
    if (document.body.dataset.page !== 'dashboard') return;

    const momentData = {
      london: {
        title: 'How London changed the way I read public space.',
        experience: 'In Westminster, I moved through streets, buildings, and gathering places where government, ceremony, and daily life overlap.',
        defaultLearning: 'Monuments and civic spaces do more than mark history. Their design can communicate national identity, authority, and who is invited to participate.',
        classroom: 'In history or civics class, I can compare Westminster with a public space in my own city and use photos as evidence.',
        family: 'I can show my family how London connected government and history to places people still use every day.',
        traveler: 'Pay attention between the landmarks. Transit, signs, routines, and shared space can teach you as much as the famous sites.',
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80',
        alt: 'London skyline and Big Ben'
      },
      paris: {
        title: 'How Paris changed the way I look at art and daily life.',
        experience: 'In Paris, I studied art in the Louvre and paid attention to neighborhood streets, meals, public spaces, and how people used the city.',
        defaultLearning: 'Art, food, and daily routines can be evidence of a culture’s values and history—not just things to look at or consume.',
        classroom: 'In art or history class, I can choose one artwork, object, or meal and connect it to a historical period or cultural idea.',
        family: 'I can explain how seeing art and daily life in context helped me understand more than a textbook image could show.',
        traveler: 'Choose one work you studied before the trip and spend a few quiet minutes noticing scale, material, and details a screen could not show.',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
        alt: 'The Eiffel Tower in Paris'
      },
      rome: {
        title: 'How Rome changed the way I read public space.',
        experience: 'At the Roman Forum, I stood inside the roads, temples, and gathering places that organized civic life.',
        defaultLearning: 'Architecture can communicate power, shared values, and who belongs in public life.',
        classroom: 'In history class, I can compare the Forum with Boston City Hall Plaza and use my own photos as evidence.',
        family: 'I can explain how standing inside the Forum made Roman government and daily life easier to understand.',
        traveler: 'Don’t try to memorize every fact. Ask what the place was built to make people think or do.',
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
        alt: 'The Colosseum in Rome'
      }
    };

    let selectedMoment = $('.moment-card[aria-pressed="true"]')?.dataset.moment || 'rome';
    let selectedUse = $('.use-card[aria-pressed="true"]')?.dataset.use || 'classroom';

    function selectButton(button, selector) {
      $$(selector).forEach((item) => {
        const selected = item === button;
        item.setAttribute('aria-pressed', String(selected));
        item.classList.toggle('is-selected', selected);
      });
    }

    $$('.moment-card').forEach((button) => button.addEventListener('click', () => {
      selectButton(button, '.moment-card');
      selectedMoment = button.dataset.moment;
      const data = momentData[selectedMoment];
      $('#learning-input').value = data.defaultLearning;
      showToast(`${selectedMoment[0].toUpperCase() + selectedMoment.slice(1)} selected.`);
    }));

    $$('.use-card').forEach((button) => button.addEventListener('click', () => {
      selectButton(button, '.use-card');
      selectedUse = button.dataset.use;
    }));

    $('#organize-reflection')?.addEventListener('click', () => {
      const data = momentData[selectedMoment];
      const learning = $('#learning-input').value.trim();
      if (learning.length < 12) {
        showToast('Add a little more about what you learned.');
        $('#learning-input').focus();
        return;
      }
      $('#draft-title').textContent = data.title;
      $('#draft-experience').textContent = data.experience;
      $('#draft-learning').textContent = learning;
      $('#draft-application').textContent = data[selectedUse];
      const photo = $('#draft-photo');
      if (photo) {
        photo.src = data.image;
        photo.alt = data.alt;
      }
      $('.draft-card')?.animate?.(
        [{ opacity: .55, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 300, easing: 'ease-out' }
      );
      showToast('Your learning summary was organized.');
    });

    $('#send-tip')?.addEventListener('click', () => {
      const tip = $('#traveler-tip')?.value.trim();
      if (!tip || tip.length < 12) {
        showToast('Add one useful, specific piece of advice.');
        $('#traveler-tip')?.focus();
        return;
      }
      showToast('Tip sent to your teacher for review.');
    });
  }

  initNavigation();
  initReveal();
  initPhotos();
  initDemoActions();
  initExplore();
  initTrip();
  initDashboard();
})();
