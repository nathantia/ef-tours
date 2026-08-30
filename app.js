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
        order: ['japan', 'lpr', 'ig', 'gas', 'costa', 'peru'],
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
        order: ['japan', 'lpr', 'ig', 'gas', 'costa', 'peru'],
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
        order: ['japan', 'lpr', 'ig', 'gas', 'costa', 'peru'],
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
        order: ['japan', 'lpr', 'ig', 'gas', 'costa', 'peru'],
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
      const audienceLabels = { student: 'For students', parent: 'For parents', educator: 'For educators' };
      profile.order.forEach((id) => {
        const card = $(`[data-trip="${id}"]`, grid);
        const why = $('[data-why]', card);
        const whyLabel = $('[data-why-label]', card);
        if (why) why.textContent = profile.copy[audience][id];
        if (whyLabel) whyLabel.textContent = audienceLabels[audience] || 'For students';
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


    $$('.filter-pill').forEach((button) => button.addEventListener('click', () => {
      const active = button.classList.toggle('is-active');
      showToast(active ? `${button.textContent.trim()} filter selected.` : `${button.textContent.trim()} filter cleared.`);
    }));

    $('#trip-sort')?.addEventListener('change', (event) => {
      const cards = $$('.trip-card', grid);
      const value = event.target.value;
      const dayCount = (card) => parseInt($('.trip-meta', card)?.textContent || '0', 10) || 0;
      if (value === 'duration-short') cards.sort((a,b) => dayCount(a)-dayCount(b));
      if (value === 'duration-long') cards.sort((a,b) => dayCount(b)-dayCount(a));
      if (value === 'az') cards.sort((a,b) => $('h3',a).textContent.localeCompare($('h3',b).textContent));
      if (value === 'featured') applyMatches(input.value, false);
      else cards.forEach(card => grid.appendChild(card));
      showToast(`Trips sorted by ${event.target.options[event.target.selectedIndex].text}.`);
    });

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
      history: { label:'History & civics plan', title:'How a country holds tradition and change together', before:'Compare one image of Tokyo and one of Kyoto. What assumptions do they create before students arrive?', during:'Collect evidence of how public space, ritual, infrastructure, and historical memory shape daily life across Japan.', after:'Build a short argument: “Where did Japan challenge the expectations we brought with us?”' },
      art: { label:'Art & design plan', title:'How design communicates values', before:'Choose one example of Japanese architecture, graphic design, or craft and identify what you expect to notice in person.', during:'Record examples of material, scale, detail, signage, and visual hierarchy from Tokyo through Kyoto.', after:'Create a visual comparison explaining how design choices changed across modern, sacred, and historical settings.' },
      language: { label:'World language plan', title:'Language, etiquette, and context', before:'Prepare practical Japanese phrases for greetings, thanks, ordering, and asking a simple question.', during:'Use language in supported daily interactions and notice how tone, gesture, and etiquette help meaning travel beyond vocabulary.', after:'Record a short reflection on one interaction and what context taught you that translation alone could not.' },
      literature: { label:'Literature plan', title:'How setting shapes perspective', before:'Read a short text connected to Tokyo, Kyoto, or Hiroshima and identify what the setting asks the reader to notice.', during:'Collect sensory details and one place that challenged the version of Japan you imagined before arrival.', after:'Write a scene or analysis using firsthand details from the trip as evidence.' }
    };

    $$('[data-day-tabs]').forEach((group) => {
      const tabs = $$('.day-tab', group);
      const panels = $$('.day-tab-panel', group);
      tabs.forEach((tab) => tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', String(active));
        });
        panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === target));
      }));
    });

    const dayCards = $$('.day-card[data-city]');
    const railStops = $$('.rail-stop[data-rail-city]');
    if ('IntersectionObserver' in window && dayCards.length && railStops.length) {
      const cityObserver = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const city = visible.target.dataset.city;
        railStops.forEach((stop) => stop.classList.toggle('is-active', stop.dataset.railCity === city));
      }, { rootMargin: '-18% 0px -62% 0px', threshold: [0,.2,.4,.6] });
      dayCards.forEach((card) => cityObserver.observe(card));
    }


    // Trip detail sticky subnav and trip-moments map
    const subnavLinks = $$('[data-subnav-link]');
    const subnavSections = subnavLinks.map((link) => $(link.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && subnavSections.length) {
      const subnavObserver = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        subnavLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`));
      }, { rootMargin: '-18% 0px -70% 0px', threshold: [0,.1,.25,.4] });
      subnavSections.forEach((section) => subnavObserver.observe(section));
    }

    const mapStories = {
      'tokyo-video': { role:'Student video · Tokyo', title:'The moment Tokyo stopped feeling overwhelming.', text:'“Once I understood the trains and the rhythm of the streets, the city started feeling exciting instead of huge.”', image:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80', alt:'Tokyo at night', action:'Play 21 sec', demo:'This short student clip would play here.' },
      'hakone-image': { role:'Student image · Hakone', title:'Seeing Fuji changed the scale of the trip.', text:'A student captures the shift from Tokyo’s density to the landscape around Hakone and Mount Fuji.', image:'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1000&q=80', alt:'Mount Fuji, Japan', action:'View story', demo:'The Hakone image story would open here.' },
      'kyoto-audio': { role:'Tour Lead audio · Kyoto', title:'When students start noticing continuity.', text:'“Kyoto helps students see that tradition is not simply preserved—it is still part of daily choices, rituals, and identity.”', image:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80', alt:'Kyoto, Japan', action:'Play 24 sec', demo:'Leo’s Kyoto Tour Lead audio would play here.' },
      'hiroshima-audio': { role:'Educator audio · Hiroshima', title:'Making space for reflection.', text:'“The most important thing here is not rushing to an answer. Students need time to process what the place is asking them to consider.”', image:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1000&q=80', alt:'Hiroshima, Japan', action:'Play 27 sec', demo:'Ms. Rivera’s Hiroshima educator audio would play here.' }
    };
    $$('.map-dot').forEach((button) => button.addEventListener('click', () => {
      const story = mapStories[button.dataset.mapStory];
      if (!story) return;
      $$('.map-dot').forEach((dot) => dot.classList.toggle('is-active', dot === button));
      $('#map-story-role').textContent = story.role;
      $('#map-story-title').textContent = story.title;
      $('#map-story-text').textContent = story.text;
      const image = $('#map-story-image');
      if (image) { image.src = story.image; image.alt = story.alt; }
      const action = $('#map-story-action');
      if (action) { action.textContent = story.action; action.dataset.demo = story.demo; }
    }));

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
      tokyo: { title:'How Tokyo changed the way I think about city systems.', experience:'In Tokyo, I moved through dense transit, public space, shrines, shopping districts, and neighborhoods that all seemed to follow their own rhythms.', defaultLearning:'A city can be extremely dense and complex while still feeling organized because design, etiquette, and shared expectations work together.', classroom:'In geography or design class, I can compare Tokyo transit and public-space behavior with the systems in my own city.', family:'I can show my family how the trip made me more confident navigating unfamiliar systems and noticing cultural differences.', traveler:'Pay attention to the ordinary systems—trains, signs, queues, and convenience stores. They teach you as much as the landmarks.', image:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80', alt:'Tokyo, Japan' },
      kyoto: { title:'How Kyoto changed what tradition meant to me.', experience:'In Kyoto, I moved through temples, shrines, gardens, and neighborhoods where historic practices still shape the experience of the city.', defaultLearning:'Tradition is not only something preserved in museums. It can continue through architecture, ritual, craft, etiquette, and everyday behavior.', classroom:'In history or art class, I can use Fushimi Inari or the Golden Pavilion to compare preservation, belief, and cultural identity.', family:'I can explain why Kyoto felt different from Tokyo and how seeing both changed my idea of what “modern Japan” means.', traveler:'Slow down at the shrines. Notice what people do before you focus on taking the picture.', image:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80', alt:'Kyoto, Japan' },
      hiroshima: { title:'How Hiroshima changed the way I think about historical memory.', experience:'In Hiroshima, I moved from historical facts into a place designed around memory, reflection, and the consequences of decisions.', defaultLearning:'A historical site can communicate facts and also shape how people understand responsibility, loss, peace, and what societies choose to remember.', classroom:'In history class, I can compare how Hiroshima and a memorial closer to home choose what to preserve, explain, and ask visitors to remember.', family:'I can explain why Hiroshima felt different from learning the same history in a classroom and why the reflection mattered.', traveler:'Give yourself time after the museum before trying to summarize what you think. Some places need space.', image:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1000&q=80', alt:'Hiroshima, Japan' }
    };

    let selectedMoment = $('.moment-card[aria-pressed="true"]')?.dataset.moment || 'hiroshima';
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


  function initPitch() {
    if (document.body.dataset.page !== 'pitch') return;
    const creatorButtons = $$('[data-creator]');
    const audienceButtons = $$('[data-pitch-audience]');
    const emphasisInputs = $$('input[name="pitch-focus"]');
    const packetAudience = $('#packet-audience');
    const packetCreator = $('#packet-creator');
    const packetHeadline = $('#packet-headline');
    const packetWhy = $('#packet-why');
    const packetLearning = $('#packet-learning');
    const packetSupport = $('#packet-support');
    const packetAsk = $('#packet-ask');
    let creator = 'student';
    let audience = 'parent';

    const audienceData = {
      parent: {
        label: 'Parent',
        headline: 'Why Japan: Land of the Rising Sun is worth saying yes to.',
        why: 'I want to experience Japan’s culture, design, history, technology, and daily life firsthand—and do it with my teacher, classmates, and EF support around us.',
        learning: 'The itinerary connects major sites to history, art, civics, and culture, with opportunities to use trip observations in class after returning.',
        support: 'EF coordinates the group travel experience, Tour Director support, hotels, transportation, and planned activities alongside the educator leading the group.',
        ask: 'Take a look at the trip with me and talk through the cost, timing, and what would make you comfortable saying yes.'
      },
      teacher: {
        label: 'Teacher',
        headline: 'A Japan trip students are ready to get behind.',
        why: 'Students are interested in a trip that makes history and culture tangible while giving them a supported first international experience.',
        learning: 'Japan creates natural opportunities to compare technology, tradition, language, design, belief, historical memory, and everyday life across very different settings.',
        support: 'EF can help turn student interest into a structured tour, with planning support and materials for building family participation.',
        ask: 'Explore whether this tour could fit your learning goals and what it would take to bring a group together.'
      },
      school: {
        label: 'School / administrator',
        headline: 'A global learning experience with a clear educational case.',
        why: 'The tour gives students direct exposure to historic, civic, artistic, and cultural contexts that are difficult to reproduce in a classroom.',
        learning: 'Students can gather observations and evidence on tour, then apply them through history, civics, art, language, or interdisciplinary classroom work.',
        support: 'The experience is organized around an educator-led group with EF travel planning and on-tour support built around the itinerary.',
        ask: 'Review the educational goals, student-development value, and group structure as part of the school approval process.'
      }
    };

    function selectOne(buttons, selected, attr) {
      buttons.forEach((button) => {
        const active = button.getAttribute(attr) === selected;
        button.classList.toggle('is-selected', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }

    function renderPacket() {
      const data = audienceData[audience];
      if (packetAudience) packetAudience.textContent = `Prepared for: ${data.label}`;
      if (packetCreator) packetCreator.textContent = `Prepared by: ${creator === 'student' ? 'Student' : 'Educator'}`;
      if (packetHeadline) packetHeadline.textContent = data.headline;
      if (packetWhy) packetWhy.textContent = data.why;
      if (packetLearning) packetLearning.textContent = data.learning;
      if (packetSupport) packetSupport.textContent = data.support;
      if (packetAsk) packetAsk.textContent = data.ask;
    }

    creatorButtons.forEach((button) => button.addEventListener('click', () => {
      creator = button.dataset.creator;
      selectOne(creatorButtons, creator, 'data-creator');
      renderPacket();
    }));
    audienceButtons.forEach((button) => button.addEventListener('click', () => {
      audience = button.dataset.pitchAudience;
      selectOne(audienceButtons, audience, 'data-pitch-audience');
      renderPacket();
    }));
    emphasisInputs.forEach((input) => input.addEventListener('change', renderPacket));

    $('#generate-packet')?.addEventListener('click', () => {
      renderPacket();
      $('.packet-preview')?.scrollIntoView({behavior:'smooth',block:'start'});
      showToast('Pitch packet tailored to your audience.');
    });

    $('#download-packet')?.addEventListener('click', () => {
      const data = audienceData[audience];
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>EF Tours pitch packet</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:48px auto;padding:0 28px;color:#0b1522;line-height:1.55}h1{font-size:38px}h2{font-size:18px;margin-top:28px}small{color:#617083}</style></head><body><small>Independent interview concept by Nathan Tia</small><h1>${data.headline}</h1><p><strong>Japan: Land of the Rising Sun · 11 days · Japan</strong></p><h2>Why this trip</h2><p>${data.why}</p><h2>What students can learn</h2><p>${data.learning}</p><h2>How EF supports the experience</h2><p>${data.support}</p><h2>The ask</h2><p>${data.ask}</p></body></html>`;
      const blob = new Blob([html], {type:'text/html'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ef-tour-pitch-${audience}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Pitch packet downloaded.');
    });

    renderPacket();
  }

  initNavigation();
  initReveal();
  initPhotos();
  initDemoActions();
  initExplore();
  initTrip();
  initDashboard();
  initPitch();
})();
