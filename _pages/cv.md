---
layout: single
title: "Curriculum vitae"
description: "Education and research interests of Shiqi Wu."
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
  - /resume/
  - /resume-json
  - /resume-json/
---

<p class="profile-kicker">{{ site.author.name }}</p>

## Education

{% for education in site.data.cv.education %}
### {{ education.institution }}

{{ education.studyType }} in {{ education.area }}
{% endfor %}

## Research interests

{% for interest in site.data.cv.interests %}
- **{{ interest.name }}**{% if interest.keywords.size > 0 %}: {{ interest.keywords | join: ", " }}{% endif %}
{% endfor %}

{% if site.publications.size > 0 %}
## Publications

<ul>
{% for post in site.publications reversed %}
  {% include archive-single-cv.html %}
{% endfor %}
</ul>
{% endif %}

## Contact

{% if site.author.email %}
Email: [{{ site.author.email }}](mailto:{{ site.author.email }})
{% endif %}

GitHub: [{{ site.author.github }}](https://github.com/{{ site.author.github }})
