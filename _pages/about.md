---
permalink: /
title: "About"
description: "Shiqi Wu, a master's student in Mathematics at Anhui University, with research interests in foundational questions in mathematics and computer science."
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

<p class="profile-kicker">Mathematics &amp; Computer Science</p>

<p class="profile-intro">I am <strong>{{ site.author.name }}</strong>, a master's student in Mathematics at <strong>{{ site.author.employer }}</strong>.</p>

My research interests lie in foundational research in mathematics and computer science, with an emphasis on mathematical principles, rigorous reasoning, and theoretical understanding.

<div class="profile-links">
  <a href="{{ '/cv/' | relative_url }}">View CV <span aria-hidden="true">&rarr;</span></a>
  <a href="https://github.com/{{ site.author.github }}">GitHub <span aria-hidden="true">&nearr;</span></a>
</div>

<section class="profile-section" aria-labelledby="research">
  <h2 id="research">Research interests</h2>
  <ol class="research-list">
    <li>
      <h3>Mathematics</h3>
      <p>Mathematical principles, rigorous reasoning, and theoretical analysis.</p>
    </li>
    <li>
      <h3>Computer science</h3>
      <p>Fundamental principles of computation and algorithms, with an emphasis on understanding why and under what conditions methods work.</p>
    </li>
  </ol>
</section>

<section class="profile-section" aria-labelledby="projects">
  <h2 id="projects">Current research projects</h2>
  <p>My current work connects mathematical foundations of learning and reasoning with uncertainty-aware multimodal methods.</p>
  <div class="project-list">
    {% for project in site.data.research.projects %}
    <article class="research-project" aria-labelledby="{{ project.id }}">
      <p class="project-field">{{ project.field | escape }}</p>
      <h3 id="{{ project.id }}">{{ project.title | escape }}</h3>
      <p>{{ project.summary | escape }}</p>
      <p class="project-focus"><strong>Focus:</strong> {{ project.focus | escape }}</p>
      {% if project.links.size > 0 %}
      <div class="project-links">
        {% for link in project.links %}
        <a href="{{ link.url | escape }}">{{ link.label | escape }} <span aria-hidden="true">&nearr;</span></a>
        {% endfor %}
      </div>
      {% endif %}
    </article>
    {% endfor %}
  </div>
  {% if site.data.research.materials.size > 0 %}
  <div class="research-materials">
    <h3>Manuscripts</h3>
    <ul>
      {% for material in site.data.research.materials %}
      <li><a href="{{ material.url | escape }}">{{ material.label | escape }}</a> <span class="material-platform">({{ material.platform | escape }})</span></li>
      {% endfor %}
    </ul>
  </div>
  {% endif %}
</section>

{% if site.data.cv.projects.size > 0 %}
<section class="profile-section" aria-labelledby="earlier-projects">
  <h2 id="earlier-projects">Earlier research experience</h2>
  {% for project in site.data.cv.projects %}
  <article class="research-project" aria-labelledby="{{ project.id }}">
    <p class="project-field">{{ project.program | escape }}</p>
    <h3 id="{{ project.id }}">{{ project.name | escape }}</h3>
    <p class="project-role"><strong>{{ project.role | escape }}</strong> · {{ project.status | escape }}</p>
    <p>{{ project.summary | escape }}</p>
    <p class="project-focus"><strong>Focus:</strong> {{ project.keywords | join: ", " | escape }}.</p>
  </article>
  {% endfor %}
</section>
{% endif %}

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
