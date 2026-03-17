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

interface ExhibitionLink {
  label: string;
  url: string;
}

interface ExhibitionWork {
  title: string;
  year: string;
  description: string;
  context: string;
  links: ExhibitionLink[];
}

const exhibitionWorkList: ExhibitionWork[] = [
  {
    title: "顔砂（かおすな）",
    year: "2026",
    description: "Webカメラで取得した映像を砂粒のシミュレーションに変換し、崩壊と再構成を繰り返す様子を可視化するインタラクティブ作品。 砂粒はセルオートマトンとして定義され、粒子の流動をthree.jsのTSL機能で実装したWebGPUベースのGPGPU処理によりリアルタイムで描画する。",
    context: "Shown at HOMEWORKS 2025 10th Anniversary",
    links: [
      {
        label: "Live site",
        url: "https://novogrammer.github.io/face-sandify/",
      },
      {
        label: "Source",
        url: "https://github.com/novogrammer/face-sandify",
      },
      {
        label: "Exhibition",
        url: "https://peatix.com/event/4680492",
      },
    ],
  },
  {
    title: "風船割りゲーム",
    year: "2023",
    description: "3Dミニゲームを僕も作ってみることにしました。",
    context: "Shown at SNACKS Vol.5",
    links: [
      {
        label: "Live site",
        url: "https://novogrammer.github.io/balloon-popping-game/",
      },
      {
        label: "Source",
        url: "https://github.com/novogrammer/balloon-popping-game",
      },
      {
        label: "Exhibition",
        url: "https://peatix.com/event/3611386",
      },
    ],
  },
  {
    title: "Rust と WebAssembly の習作",
    year: "2022",
    description: "Rust の学習のために負荷の高めな処理を Rust でプログラミングし、WebAssembly 用に書き出し、three.js で描画するプログラムを作りました。",
    context: "Shown at SNACKS Vol.4",
    links: [
      {
        label: "Live site",
        url: "https://novogrammer.github.io/rust-voxel-polygon-study/",
      },
      {
        label: "Source",
        url: "https://github.com/novogrammer/rust-voxel-polygon-study",
      },
      {
        label: "Exhibition",
        url: "https://peatix.com/event/3293270",
      },
    ],
  },
];

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
        url:"https://www.facebook.com/groups/196438880943262",
        text:"アンテナ大阪のFacebook",
      },
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
  <section class="p-section-exhibitions">
    <div class="p-section-exhibitions__content">
      <h2 class="p-section-exhibitions__title">Personal Works</h2>
      <ul class="p-section-exhibitions__list">
        ${exhibitionWorkList.map((work)=>{
          return `
            <li class="p-section-exhibitions__item">
              <article class="p-section-exhibitions__card">
                <p class="p-section-exhibitions__meta">${work.year}</p>
                <h3 class="p-section-exhibitions__work-title">${work.title}</h3>
                <p class="p-section-exhibitions__description">${work.description}</p>
                <p class="p-section-exhibitions__context">${work.context}</p>
                <ul class="p-section-exhibitions__links">
                  ${work.links.map((link)=>{
                    return `<li class="p-section-exhibitions__link-item"><a href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a></li>`;
                  }).join("\n")}
                </ul>
              </article>
            </li>
          `;
        }).join("\n")}
      </ul>
    </div>
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
