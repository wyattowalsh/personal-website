---
layout: page
title: 👨‍💻 Blog
pagination: 
  enabled: true
---
<h2> Latest Blog Posts: </h2>

<!-- <source url="https://medium.com/feed/@wyattowalsh">Latest Blog Posts</source> -->

{% for e in paginator.posts %}

<div style="background-color:#e1ebf0;">
	<div class="row" style="margin-left: 25px;margin-right: 25px;">
		<h3>{{e.title}}</h3>
		<p>{{e.feed_content}}</p>
		<br>
	</div>
</div>

{% endfor %}


<!-- This loops through the paginated posts -->
<!-- {% for post in paginator.posts %}

  <h1>{{ post.feed_content }}</h1>
{% endfor %} -->
<!-- {% if paginator.total_pages > 1 %}
<ul>
  {% if paginator.previous_page %}
  <li>
    <a href="{{ paginator.previous_page_path | prepend: site.baseurl }}">Newer</a>
  </li>
  {% endif %}
  {% if paginator.next_page %}
  <li>
    <a href="{{ paginator.next_page_path | prepend: site.baseurl }}">Older</a>
  </li>
  {% endif %}
</ul>
{% endif %} -->
<div align="center" style="background-color:#d0e0e8;">
{% if paginator.total_pages > 1 %}
<ul>
  {% if paginator.previous_page %}
    <a href="{{ paginator.previous_page_path | prepend: site.baseurl }}"> Newer </a>
  {% endif %}
  {% for trail in paginator.page_trail %}
    {% if page.url == trail.path %}{% endif %}
        <a href="{{ trail.path | prepend: site.baseurl }}" title="{{trail.title}}"> {{ trail.num }} </a>
  {% endfor %}
  {% if paginator.next_page %}
    <a href="{{ paginator.next_page_path | prepend: site.baseurl }}"> Older </a>
  {% endif %}
</ul>
{% endif %}
{% if paginator.page_trail %}
{% endif %}
