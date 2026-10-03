/* Keyword Constellation | dependency-free browser interactions | MIT License */ "use strict";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [
  ...root.querySelectorAll(selector)
];
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  '"':"&quot;",
  "'":"&#39;"
}
[
  char
]));
const toast = message =>{
   const node = $(".toast");
   if (!node) return;
   node.textContent = message;
   node.classList.add("is-visible");
   clearTimeout(window.toastTimer);
   window.toastTimer = setTimeout(() => node.classList.remove("is-visible"), 2600);
};
const downloadText = (filename, text, type = "text/plain;charset=utf-8") =>{
   const url = URL.createObjectURL(new Blob([
    text
  ],{
    type
  }));
   const link = document.createElement("a");
   link.href = url;
   link.download = filename;
   link.click();
   setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const copyText = async text =>{
   try{
     await navigator.clipboard.writeText(text);
     return true;
  }
   catch{
     const field = document.createElement("textarea");
     field.value = text;
     field.style.position = "fixed";
     field.style.opacity = "0";
     document.body.append(field);
     field.select();
     const ok = document.execCommand("copy");
     field.remove();
     return ok;
  }
};
const readFileText = file => new Promise((resolve, reject) =>{
   const reader = new FileReader();
   reader.onload = () => resolve(String(reader.result));
   reader.onerror = () => reject(new Error("Could not read this file."));
   reader.readAsText(file);
});
const parseCSV = text =>{
   const rows = [
  ];
   let row = [
  ], cell = "", quoted = false;
   for (let i = 0; i < text.length; i++){
     const c = text[
      i
    ];
     if (quoted){
       if (c === '"' && text[
        i + 1
      ]
       === '"'){
         cell += '"';
         i++;
      }
       else if (c === '"') quoted = false;
       else cell += c;
    }
     else if (c === '"') quoted = true;
     else if (c === ","){
       row.push(cell);
       cell = "";
    }
     else if (c === "\n"){
       row.push(cell.replace(/\r$/, ""));
       if (row.some(value => value.trim())) rows.push(row);
       row = [
      ];
       cell = "";
    }
     else cell += c;
  }
   row.push(cell.replace(/\r$/, ""));
   if (row.some(value => value.trim())) rows.push(row);
   return rows;
};
const saveJSON = (key, value) =>{
   try{
     localStorage.setItem(key, JSON.stringify(value));
     return true;
  }
   catch{
     return false;
  }
};
const loadJSON = (key, fallback) =>{
   try{
     return JSON.parse(localStorage.getItem(key)) ?? fallback;
  }
   catch{
     return fallback;
  }
};
const menuButton = $(".menu-toggle"), nav = $("#main-navigation");
menuButton?.addEventListener("click", () =>{
   const opened = nav.classList.toggle("is-open");
   menuButton.setAttribute("aria-expanded", String(opened));
   menuButton.setAttribute("aria-label", opened ? "Close navigation" : "Open navigation");
});
nav?.addEventListener("click", event =>{
   if (event.target.closest("a")){
     nav.classList.remove("is-open");
     menuButton?.setAttribute("aria-expanded", "false");
  }
});
$$('[data-toast]').forEach(button => button.addEventListener("click", () => toast(button.dataset.toast)));
$$('[data-scroll]').forEach(button => button.addEventListener("click", () => $(button.dataset.scroll)?.scrollIntoView({
  behavior:"smooth"
})));
let keywordGroups=[
];
const tokenize=value=>value.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s-]/gu," ").split(/[\s-]+/).filter(word=>word.length>1);
const renderKeywords=()=>{
  const threshold=Number($("#cluster-size").value),lines=[
    ...new Set($("#keyword-input").value.split(/\r?\n/).map(value=>value.trim()).filter(Boolean))
  ];
  const terms=lines.map((phrase,index)=>({
    phrase,
    index,
    tokens:new Set(tokenize(phrase))
  }));
  const parent=terms.map((_,i)=>i);
  const find=i=>parent[
    i
  ]
  ===i?i:(parent[
    i
  ]
  =find(parent[
    i
  ]));
  const union=(a,b)=>{
    const x=find(a),y=find(b);
    if(x!==y)parent[
      y
    ]
    =x;
  };
  for(let i=0;i<terms.length;i++)for(let j=i+1;j<terms.length;j++){
    const overlap=[
      ...terms[
        i
      ].tokens
    ].filter(word=>terms[
      j
    ].tokens.has(word)).length;
    if(overlap>=threshold)union(i,j);
  }
  const buckets=new Map();
  terms.forEach(term=>{
    const key=find(term.index);
    if(!buckets.has(key))buckets.set(key,[
    ]);
    buckets.get(key).push(term.phrase);
  });
  keywordGroups=[
    ...buckets.values()
  ].sort((a,b)=>b.length-a.length).map((phrases,index)=>({
    name:phrases.length>1?'Theme '+String(index+1).padStart(2,
    '0'):"Explore separately",
    phrases
  }));
  const query=$("#intent-filter").value;
  const filtered=keywordGroups.map(group=>({
    ...group,
    phrases:group.phrases.filter(phrase=>query==='all'||(query==='commercial'?/best|buy|price|compare|service|tool|review|near me|agency/i.test(phrase):/how|what|why|guide|ideas|learn|tips/i.test(phrase)))
  })).filter(group=>group.phrases.length);
  $("#keyword-results").innerHTML=filtered.length?filtered.map(group=>'<section class="cluster-group"><div class="cluster-heading"><h3>'+escapeHTML(group.name)+'</h3><span>'+group.phrases.length+' ideas</span></div><div class="keyword-pills">'+group.phrases.map(phrase=>'<span class="keyword-pill">'+escapeHTML(phrase)+'</span>').join("")+'</div></section>').join(""):'<div class="empty-state"><h3>No ideas match that hint.</h3><p>Choose another intent view or add more phrases.</p></div>';
};
$("#cluster-keywords")?.addEventListener("click",renderKeywords);
$("#cluster-size")?.addEventListener("change",renderKeywords);
$("#intent-filter")?.addEventListener("change",renderKeywords);
$("#export-keywords")?.addEventListener("click",()=>{
  if(!keywordGroups.length)renderKeywords();
  downloadText("keyword-constellation.csv","cluster,keyword\n"+keywordGroups.flatMap(group=>group.phrases.map(phrase=>'"'+group.name+'","'+phrase.replaceAll('"','""')+'"')).join("\n"),"text/csv;charset=utf-8");
});
renderKeywords();
