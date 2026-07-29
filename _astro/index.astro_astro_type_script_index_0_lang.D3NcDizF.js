import{s as E,i as j,e as B,f as R,a as S,p as P,I as H,G as x,b as r,l as G,c as C,d as O,v as N,g as D}from"./escape-html.CW00gxiH.js";function U(e,s,t){const n=B(e);return{issue_id:e.issue_id,title:e.subject,public_url:`${s}/issues/${n}/`,publication_status:e.status,published_at:e.published_at,updated_at:e.published_at||e.publish_date,...t?{thumbnail:t}:{},source_count:e.articles.length}}async function F(e,s,t){const n=E(e.filter(a=>j(a.status,a.visibility)));return Promise.all(n.map(async a=>U(a,s,await t(a))))}const g=452;function q(e){let s;try{s=JSON.parse(e)}catch{return null}if(!s||typeof s!="object")return null;const t=s,n=Number(t.last_completed_page??0);return Number.isFinite(n)?{lastCompletedPage:n,updatedAt:typeof t.updated_at=="string"?t.updated_at:"",completedCount:Array.isArray(t.completed_source_ids)?t.completed_source_ids.length:0,failedCount:Array.isArray(t.failed_source_ids)?t.failed_source_ids.length:0,targetPage:g,percent:Math.min(100,Math.round(n/g*100)),complete:n>=g}:null}async function W(e,s,t,n){const a=await S(e,`content/issues/${s}/index.md`,t,n),{data:i}=P(a);return H.parse(i)}async function K(e,s,t){try{const n=await S(e,"data/crawl-checkpoint.json",s,t);return q(n)}catch(n){if(n instanceof x&&n.status===404)return null;throw n}}async function Q(e,s,t,n=fetch){const a=await R(e,"content/issues",s,n),[i,l]=await Promise.all([Promise.all(a.map(o=>W(e,o,s,n))),K(e,s,n)]),u=E(i),p=await F(i,t,async()=>{});return{crawlProgress:l,allIssues:u,publishedIssues:p}}const b=20,V=[{value:"id_desc",label:"최신 호 순"},{value:"id_asc",label:"오래된 호 순"},{value:"status",label:"상태순"},{value:"subject",label:"제목순"}];function A(e,s){const t=[...e];switch(s){case"id_desc":t.sort((n,a)=>a.issue_id.localeCompare(n.issue_id));break;case"id_asc":t.sort((n,a)=>n.issue_id.localeCompare(a.issue_id));break;case"status":t.sort((n,a)=>n.status.localeCompare(a.status)||a.issue_id.localeCompare(n.issue_id));break;case"subject":t.sort((n,a)=>n.subject.localeCompare(a.subject,"ko"));break}return t}function z(e,s){const t=s.trim().toLowerCase();return t===""?e:e.filter(n=>n.issue_id.toLowerCase().includes(t)||n.subject.toLowerCase().includes(t))}const J={draft:{label:"초안",tone:"neutral"},review_requested:{label:"검토 요청",tone:"warning"},approved:{label:"승인됨",tone:"info"},sending:{label:"발송 중",tone:"warning"},sent:{label:"발송 완료",tone:"success"},cancelled:{label:"취소됨",tone:"neutral"},ready:{label:"공개 준비",tone:"info"},published:{label:"공개 중",tone:"success"},unpublished:{label:"비공개",tone:"warning"},archived:{label:"보관됨",tone:"neutral"}},Y=[{icon:"📝",title:"콘텐츠 관리",body:"기사 편집(제목·요약·썸네일), 뉴스레터 호 작성과 기사 구성, 발행 상태 관리는 모두 /admin/에서 이루어집니다. GitHub 계정으로 로그인해야 하며, 해당 저장소에 접근 권한이 있는 계정만 실제로 내용을 보거나 수정할 수 있습니다.",href:"/admin/",label:"/admin/ 열기"},{icon:"👥",title:"수신인 · 발신인",body:"뉴스레터를 받을 사람 추가/삭제는 /admin-recipients/에서 관리합니다. 테스트 수신과 실제 발송 수신은 서로 다른 플래그로 독립적으로 관리되며, SMTP 비밀번호 등 발신 계정의 민감 정보는 여기서 다루지 않습니다.",href:"/admin-recipients/",label:"/admin-recipients/ 열기"},{icon:"📤",title:"발송",body:"테스트 발송과 실제 발송은 모두 GitHub Actions에서만 실행됩니다. 실제 발송은 이슈 ID와 정확히 일치하는 확인 문구를 직접 입력해야만 실행되는 의도된 이중 확인 절차이며, 이 대시보드의 어떤 조작으로도 건너뛸 수 없습니다.",href:"/admin-send/",label:"/admin-send/ 에서 자세히 보기"}];function $(e){return e?e.slice(0,10):"-"}function Z(e){return e.public_slug.trim()||e.issue_id}function X(e){const s=e.crawlProgress,t=s?`<span class="stat-value">${s.lastCompletedPage} / ${s.targetPage} 페이지 (${s.percent}%)</span>
       <span class="stat-sub">수집 기사 ${s.completedCount}개 · 실패/재시도 ${s.failedCount}개 · ${s.complete?"완료":"진행 중"}</span>`:'<span class="stat-value stat-value-muted">기록 없음</span>';return`
    <section>
      <h2>현황 요약</h2>
      <div class="stat-grid">
        <div class="stat-card card">
          <span class="stat-label">공개 중</span>
          <span class="stat-value">${e.publishedIssues.length}개</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">전체 뉴스레터 호</span>
          <span class="stat-value">${e.allIssues.length}개</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">크롤링 진행률</span>
          ${t}
        </div>
      </div>
    </section>`}function ee(e){return e.publishedIssues.length===0?`
      <section>
        <h2>현재 공개 중</h2>
        <p>지금 공개 사이트에 실제로 노출되고 있는 뉴스레터 호 목록입니다.</p>
        <p class="empty">현재 공개 중인 뉴스레터 호가 없습니다.</p>
      </section>`:`
    <section>
      <h2>현재 공개 중</h2>
      <p>지금 공개 사이트에 실제로 노출되고 있는 뉴스레터 호 목록입니다.</p>
      <ul class="published-list">${e.publishedIssues.map(t=>`
      <li class="published-item card">
        ${t.thumbnail?`<img src="${r(t.thumbnail)}" alt="" loading="lazy" />`:""}
        <div class="published-item-body">
          <h3>${r(t.title)}</h3>
          <dl>
            <div><dt>공개일</dt><dd>${$(t.published_at||t.updated_at)}</dd></div>
            <div><dt>최종 갱신</dt><dd>${$(t.updated_at)}</dd></div>
            <div><dt>포함 기사 수</dt><dd>${t.source_count}개</dd></div>
          </dl>
          <a href="${r(t.public_url)}" rel="noopener">사이트에서 보기 →</a>
        </div>
      </li>`).join("")}</ul>
    </section>`}function te(e,s){const t=J[e.status],n=`${s}/manage/preview/${r(Z(e))}`;return`
      <li class="issue-row card">
        <div class="issue-row-main">
          <span class="badge" data-tone="${t.tone}">${t.label}</span>
          <span class="issue-row-id">${r(e.issue_id)}</span>
          <span class="issue-row-subject">${r(e.subject)}</span>
        </div>
        <a class="btn btn-primary" href="${n}">미리보기 →</a>
      </li>`}function L(e,s){return e.length===0?'<p class="empty" id="issue-preview-empty">검색 결과가 없습니다.</p>':`<ul class="issue-table">${e.map(t=>te(t,s)).join("")}</ul>`}function k(e,s){if(s<=1)return"";const t=Array.from({length:s},(n,a)=>a+1).map(n=>`<button type="button" class="pagination-link${n===e?" active":""}" data-page="${n}" aria-current="${n===e?"page":"false"}">${n}</button>`).join("");return`
    <nav class="pagination" aria-label="미리보기 목록 페이지 이동">
      <button type="button" class="pagination-link${e<=1?" disabled":""}" data-page="${Math.max(1,e-1)}" aria-disabled="${e<=1}">이전</button>
      ${t}
      <button type="button" class="pagination-link${e>=s?" disabled":""}" data-page="${Math.min(s,e+1)}" aria-disabled="${e>=s}">다음</button>
    </nav>`}function se(e,s){if(e.allIssues.length===0)return`
      <section>
        <h2>전체 뉴스레터 호 미리보기</h2>
        <p class="empty">등록된 뉴스레터 호가 없습니다.</p>
      </section>`;const t=A(e.allIssues,"id_desc").slice(0,b),n=Math.ceil(e.allIssues.length/b);return`
    <section>
      <h2>전체 뉴스레터 호 미리보기</h2>
      <p>
        실제 공개 여부와 무관하게, 모든 뉴스레터 호가 발행되면 어떤 화면으로 보일지 미리 확인할 수
        있습니다. 미리보기 화면은 관리자에게만 보이며, 공개 사이트에는 절대 노출되지 않습니다.
      </p>
      <div class="issue-preview-controls">
        <div class="search-box">
          <label for="issue-preview-search">검색</label>
          <input
            id="issue-preview-search"
            type="search"
            placeholder="호 ID나 제목으로 검색"
            autocomplete="off"
          />
        </div>
        <div class="sort-box">
          <label for="issue-preview-sort">정렬</label>
          <select id="issue-preview-sort">${V.map(i=>`<option value="${i.value}">${i.label}</option>`).join("")}</select>
        </div>
      </div>
      <div id="issue-preview-list">${L(t,s)}</div>
      <div id="issue-preview-pagination">${k(1,n)}</div>
    </section>`}function ne(){return`
    <section>
      <h2>바로가기</h2>
      <div class="quicklink-grid">${Y.map(s=>`
      <div class="quicklink-card card">
        <span class="quicklink-icon" aria-hidden="true">${s.icon}</span>
        <h3>${s.title}</h3>
        <p>${s.body}</p>
        <a class="btn btn-primary" href="${s.href}">${s.label}</a>
      </div>`).join("")}</div>
    </section>`}function ae(e){return`
    <section>
      <h2>자동 작업 요청</h2>
      <p>
        최근 기사 수집, 특정 기사 재수집, 예시 호 생성, 공개/비공개/보관 전환, 사이트 재배포, 테스트
        발송 같은 작업은 <code>/admin/</code>의 <strong>운영 요청</strong> 컬렉션에서 양식을 채워
        요청할 수 있습니다. 터미널이나 git을 직접 다루지 않고도 작업을 요청하는 창구입니다. 다만
        현재는 이 요청을 실제로 실행하는 자동화가 아직 구축되어 있지 않아, 기술 관리자가 요청을
        확인하고 직접 처리합니다. 완전 자동화는 이후 단계의 작업입니다.
      </p>
    </section>
    <section>
      <h2>공개 · 비공개 · 아카이브</h2>
      <p>뉴스레터 호는 발행 후에도 다음 세 가지 공개 상태를 오갈 수 있습니다.</p>
      <ul>
        <li><strong>공개(published)</strong> - 공개 사이트의 발행 목록과 상세 페이지에 노출됩니다.</li>
        <li><strong>비공개(unpublished)</strong> - 다음 배포부터 공개 사이트에서 완전히 사라집니다. 다시 공개로 되돌릴 수 있습니다.</li>
        <li><strong>아카이브(archived)</strong> - 비공개와 마찬가지로 공개 사이트에서 사라지며, 더 이상 재발행 대상이 아닌 호를 정리해 둘 때 사용합니다.</li>
      </ul>
      <p>
        <strong>공개 사이트에서 무언가를 내리는 것은 언제나 <code>/admin/</code>에서 상태를 바꾸는
        것으로만 이루어지며, 공개 저장소(<code>swebin-newsletter.github.io</code>)를 직접 수정하는
        방식으로는 절대 하지 않습니다.</strong> 공개 저장소는 이 저장소의 빌드 결과가 그대로 반영되는 대상일 뿐입니다.
      </p>
    </section>
    <section>
      <h2>로그인 전이라면</h2>
      <p>
        위 링크를 열면 GitHub 로그인 화면으로 이동합니다. 이 뉴스레터의 저장소에 대한 쓰기 권한이
        없는 계정으로는 로그인해도 콘텐츠나 수신인 데이터를 보거나 바꿀 수 없습니다. 권한이
        필요하면 <a href="mailto:${r(e)}">${r(e)}</a>로 문의해 주세요.
      </p>
    </section>`}function ie(e,s,t){return[X(e),ee(e),se(e,s),ne(),ae(t)].join(`
`)}const le="https://swebin-sveltia-auth.swebin-newsletter.workers.dev",y={owner:"swebin-dev",repo:"swebin-newsletter",ref:"main"},oe="swebin.newsletter@gmail.com",f=document.getElementById("manage-status"),v=document.getElementById("manage-dashboard"),d=document.getElementById("login-btn"),h=document.getElementById("logout-btn"),m=document.getElementById("account-label");function c(e){f.innerHTML="";const s=document.createElement("p");s.textContent=e,f.appendChild(s)}function re(e,s){const t=document.getElementById("issue-preview-search"),n=document.getElementById("issue-preview-sort"),a=document.getElementById("issue-preview-list"),i=document.getElementById("issue-preview-pagination");if(!t||!n||!a||!i)return;let l=1;function u(){const p=z(e,t.value),o=A(p,n.value),w=Math.max(1,Math.ceil(o.length/b));l=Math.min(l,w);const _=(l-1)*b,T=o.slice(_,_+b);a.innerHTML=L(T,s),i.innerHTML=k(l,w)}t.addEventListener("input",()=>{l=1,u()}),n.addEventListener("change",()=>{l=1,u()}),i.addEventListener("click",p=>{const o=p.target.closest("button[data-page]");!o||o.classList.contains("disabled")||(l=Number(o.getAttribute("data-page")),u())})}async function M(e){if(c("불러오는 중입니다..."),!await N(y,e)){C(),d.hidden=!1,h.hidden=!0,m.hidden=!0,c("이 저장소에 대한 접근 권한이 없는 계정입니다. 권한이 있는 계정으로 다시 로그인해 주세요.");return}const t=await D(e);t&&(m.textContent=`${t}(으)로 로그인됨`,m.hidden=!1);try{const n=await Q(y,e,window.location.origin);v.innerHTML=ie(n,window.location.origin,oe),re(n.allIssues,window.location.origin),v.hidden=!1,d.hidden=!0,h.hidden=!1,c(""),f.hidden=!0}catch{c("불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.")}}d.addEventListener("click",async()=>{d.disabled=!0,c("로그인 창을 여는 중입니다...");try{const e=await G({workerBaseUrl:le});await M(e)}catch(e){c(e instanceof Error?e.message:"로그인에 실패했습니다.")}finally{d.disabled=!1}});h.addEventListener("click",()=>{C(),v.hidden=!0,d.hidden=!1,h.hidden=!0,m.hidden=!0,f.hidden=!1,c("로그아웃했습니다. 다시 보려면 로그인해 주세요.")});const I=O();I&&(h.hidden=!1,d.hidden=!0,M(I));
