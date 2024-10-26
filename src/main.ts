import App from './App';
import './scss/style.scss'

interface ResourceItem {
  text: string;
  url: string;
}

interface ResourceCategory {
  name: string;
  items: ResourceItem[];
}

const resourceCategoryList: ResourceCategory[] = [
  {
    name: "SNS",
    items: [
      {
        url: "https://x.com/novogrammer",
        text: "𝕏",
      },
      {
        url: "https://bsky.app/profile/novogrammer.bsky.social",
        text: "Bluesky",
      },
      {
        url: "https://www.threads.net/@novogrammer",
        text: "Threads",
      },
      {
        url: "https://www.facebook.com/novogrammer",
        text: "Facebook",
      },
      {
        url: "https://www.instagram.com/novogrammer/",
        text: "Instagram",
      },
    ],
  },
  {
    name: "Dev",
    items: [
      {
        url: "https://github.com/novogrammer",
        text: "github",
      },
      {
        url: "https://www.shadertoy.com/user/novogrammer",
        text: "shadertoy",
      },
      {
        url: "https://codepen.io/novogrammer",
        text: "codepen.io",
      },
    ],
  },
  {
    name: "Community",
    items: [
      {
        url: "https://scrapbox.io/antenna-osaka/",
        text: "アンテナ大阪のscrapbox",
      },
    ],
  },
];


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div class="l-main">
  <section class="p-section-hero">
    <h1 class="p-section-hero__title">novogrammer is here.</h1>
  </section>
  <section class="p-section-about">
    <h2 class="p-section-about__title">novogrammer is a programmer.</h2>
  </section>
  <section class="p-section-rapier">
  </section>
  <section class="p-section-resources">
    <div class="p-section-resources__content">
      <h2 class="p-section-resources__title">Resources</h2>
      ${resourceCategoryList.map((resourceCategory)=>{
        const result=[
          `<h3 class="p-section-resources__sub-title">${resourceCategory.name}</h3>`,
          [
            `<ul class="p-section-resources__list">`,
            resourceCategory.items.map((item)=>{
              return `<li class="p-section-resources__item"><a href="${item.url}" target="_blank">${item.text}</a></li>`;
            }).join("\n")+"\n",
            `</ul>`,
          ].join("\n")+"\n",
        ]
        return result.join("\n")+"\n";
      }).join("\n")}
    </div>
  </section>
  <footer class="p-footer">
    <div class="p-footer__copyright">&copy; 2024 novogrammer</div>
  </footer>
</div>
`

App.initAsync().then(()=>{
  (window as any).app=new App();
}).catch((error)=>{
  console.error(error);
})
