import './scss/style.scss'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div class="l-main">
  <section class="p-section-hero">
    <h1 class="p-section-hero__title">novogrammer is here.</h1>
  </section>
  <section class="p-section-about">
    <h2 class="p-section-about__title">novogrammer is a programmer.</h2>
  </section>
  <section class="p-section-resources">
    <div class="p-section-resources__content">
      <h2 class="p-section-resources__title">Resources</h2>
      <h3 class="p-section-resources__sub-title">sns</h3>
      <ul class="p-section-resources__list">
        <li class="p-section-resources__item"><a href="https://x.com/novogrammer" target="_blank">𝕏</a></li>
        <li class="p-section-resources__item"><a href="https://bsky.app/profile/novogrammer.bsky.social" target="_blank">Bluesky</a></li>
        <li class="p-section-resources__item"><a href="https://www.threads.net/@novogrammer" target="_blank">Threads</a></li>
        <li class="p-section-resources__item"><a href="https://www.facebook.com/novogrammer" target="_blank">Facebook</a></li>
        <li class="p-section-resources__item"><a href="https://www.instagram.com/novogrammer/" target="_blank">Instagram</a></li>
      </ul>
      <h3 class="p-section-resources__sub-title">dev</h3>
      <ul class="p-section-resources__list">
        <li class="p-section-resources__item"><a href="https://github.com/novogrammer" target="_blank">github</a></li>
        <li class="p-section-resources__item"><a href="https://www.shadertoy.com/user/novogrammer" target="_blank">shadertoy</a></li>
        <li class="p-section-resources__item"><a href="https://codepen.io/novogrammer" target="_blank">codepen.io</a></li>
      </ul>
      <h3 class="p-section-resources__sub-title">community</h3>
      <ul class="p-section-resources__list">
        <li class="p-section-resources__item"><a href="https://scrapbox.io/antenna-osaka/" target="_blank">アンテナ大阪のscrapbox</a></li>
      </ul>
    </div>
  </section>
  <footer class="p-footer">
    <div class="p-footer__copyright">&copy; 2024 novogrammer</div>
  </footer>
</div>
`

