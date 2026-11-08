---
permalink: /
title: "About"
description: "Shiqi Wu, a master's student in Mathematics at Anhui University, with research interests in multimodal reliable perception and robust learning."
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

<p class="profile-kicker">Mathematics &amp; Reliable Perception</p>

<p class="profile-intro">I am <strong>{{ site.author.name }}</strong>, a master's student in Mathematics at <strong>{{ site.author.employer }}</strong>.</p>

My research interests include multimodal reliable perception, RGBT tracking, test-time adaptation, uncertainty modeling, and robust learning.

<div class="profile-links">
  <a href="{{ '/cv/' | relative_url }}">View CV <span aria-hidden="true">&rarr;</span></a>
  <a href="https://github.com/{{ site.author.github }}">GitHub <span aria-hidden="true">&nearr;</span></a>
</div>

<section class="profile-section" aria-labelledby="research">
  <h2 id="research">Research interests</h2>
  <ol class="research-list">
    <li>
      <h3>Multimodal reliable perception</h3>
      <p>RGBT tracking and reliable perception across visual modalities.</p>
    </li>
    <li>
      <h3>Adaptation &amp; robust learning</h3>
      <p>Test-time adaptation and robust learning under changing conditions.</p>
    </li>
    <li>
      <h3>Uncertainty modeling</h3>
      <p>Modeling uncertainty in perception and learning.</p>
    </li>
  </ol>
</section>

<section class="profile-section" aria-labelledby="education">
  <h2 id="education">Education</h2>
  {% for education in site.data.cv.education %}
  <div class="education-entry">
    <h3>{{ education.institution }}</h3>
    <p>{{ education.studyType }} in {{ education.area }}</p>
  </div>
  {% endfor %}
</section>

<section class="profile-section" aria-labelledby="contact">
  <h2 id="contact">Contact</h2>
  {% if site.author.email %}
  <p>Email: <a class="contact-email" href="mailto:{{ site.author.email }}">{{ site.author.email }}</a></p>
  {% endif %}
  <p>You can also find me on <a href="https://github.com/{{ site.author.github }}">GitHub</a>.</p>
</section>
