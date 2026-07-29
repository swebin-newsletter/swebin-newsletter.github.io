import{s as S,i as B,e as q,f as O,a as C,p as P,I as x,G as H,b as c,c as A,o as G,d as l,g as N,l as D,h as L,j as F,v as U,k as W}from"./escape-html.D2325DL7.js";function K(e,s,t){const n=q(e);return{issue_id:e.issue_id,title:e.subject,public_url:`${s}/issues/${n}/`,publication_status:e.status,published_at:e.published_at,updated_at:e.published_at||e.publish_date,...t?{thumbnail:t}:{},source_count:e.articles.length}}async function J(e,s,t){const n=S(e.filter(a=>B(a.status,a.visibility)));return Promise.all(n.map(async a=>K(a,s,await t(a))))}const v=452;function Q(e){let s;try{s=JSON.parse(e)}catch{return null}if(!s||typeof s!="object")return null;const t=s,n=Number(t.last_completed_page??0);return Number.isFinite(n)?{lastCompletedPage:n,updatedAt:typeof t.updated_at=="string"?t.updated_at:"",completedCount:Array.isArray(t.completed_source_ids)?t.completed_source_ids.length:0,failedCount:Array.isArray(t.failed_source_ids)?t.failed_source_ids.length:0,failedPagesCount:Array.isArray(t.failed_pages)?t.failed_pages.length:0,targetPage:v,percent:Math.min(100,Math.round(n/v*100)),complete:n>=v}:null}async function V(e,s,t,n){const a=await C(e,`content/issues/${s}/index.md`,t,n),{data:i}=P(a);return x.parse(i)}async function z(e,s,t){try{const n=await C(e,"data/crawl-checkpoint.json",s,t);return Q(n)}catch(n){if(n instanceof H&&n.status===404)return null;throw n}}async function Y(e,s,t,n=fetch){const a=await O(e,"content/issues",s,n),[i,r]=await Promise.all([Promise.all(a.map(o=>V(e,o,s,n))),z(e,s,n)]),p=S(i),b=await J(i,t,async()=>{});return{crawlProgress:r,allIssues:p,publishedIssues:b}}const h=20,Z=[{value:"id_desc",label:"최신 호 순"},{value:"id_asc",label:"오래된 호 순"},{value:"status",label:"상태순"},{value:"subject",label:"제목순"}];function T(e,s){const t=[...e];switch(s){case"id_desc":t.sort((n,a)=>a.issue_id.localeCompare(n.issue_id));break;case"id_asc":t.sort((n,a)=>n.issue_id.localeCompare(a.issue_id));break;case"status":t.sort((n,a)=>n.status.localeCompare(a.status)||a.issue_id.localeCompare(n.issue_id));break;case"subject":t.sort((n,a)=>n.subject.localeCompare(a.subject,"ko"));break}return t}function X(e,s){const t=s.trim().toLowerCase();return t===""?e:e.filter(n=>n.issue_id.toLowerCase().includes(t)||n.subject.toLowerCase().includes(t))}const ee={draft:{label:"초안",tone:"neutral"},review_requested:{label:"검토 요청",tone:"warning"},approved:{label:"승인됨",tone:"info"},sending:{label:"발송 중",tone:"warning"},sent:{label:"발송 완료",tone:"success"},cancelled:{label:"취소됨",tone:"neutral"},ready:{label:"공개 준비",tone:"info"},published:{label:"공개 중",tone:"success"},unpublished:{label:"비공개",tone:"warning"},archived:{label:"보관됨",tone:"neutral"}},te=[{icon:"📝",title:"콘텐츠 관리",body:"기사 편집(제목·요약·썸네일), 뉴스레터 호 작성과 기사 구성, 발행 상태 관리는 모두 /admin/에서 이루어집니다. GitHub 계정으로 로그인해야 하며, 해당 저장소에 접근 권한이 있는 계정만 실제로 내용을 보거나 수정할 수 있습니다.",href:"/admin/",label:"/admin/ 열기"},{icon:"👥",title:"수신인 · 발신인",body:"뉴스레터를 받을 사람 추가/삭제는 /admin-recipients/에서 관리합니다. 테스트 수신과 실제 발송 수신은 서로 다른 플래그로 독립적으로 관리되며, SMTP 비밀번호 등 발신 계정의 민감 정보는 여기서 다루지 않습니다.",href:"/admin-recipients/",label:"/admin-recipients/ 열기"},{icon:"📤",title:"발송",body:"테스트 발송과 실제 발송은 모두 GitHub Actions에서만 실행됩니다. 실제 발송은 이슈 ID와 정확히 일치하는 확인 문구를 직접 입력해야만 실행되는 의도된 이중 확인 절차이며, 이 대시보드의 어떤 조작으로도 건너뛸 수 없습니다.",href:"/admin-send/",label:"/admin-send/ 에서 자세히 보기"}];function I(e){return e?e.slice(0,10):"-"}function se(e){return e.public_slug.trim()||e.issue_id}function ne(e){const s=e.crawlProgress,t=s?`<span class="stat-value">${s.lastCompletedPage} / ${s.targetPage} 페이지 (${s.percent}%)</span>
       <span class="stat-sub">총 게시물 ${s.completedCount}개 · 부서진 페이지 ${s.failedPagesCount}개 · 실패 기사 ${s.failedCount}개 · ${s.complete?"완료":"진행 중"}</span>`:'<span class="stat-value stat-value-muted">기록 없음</span>';return`
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
    </section>`}function ae(){return`
    <section>
      <h2>최근 기사 업데이트</h2>
      <p>
        버튼을 누르면 원문 사이트에서 새로 올라온 기사를 자동으로 가져오도록 요청합니다. GitHub
        Actions가 자동으로 실행하며 보통 몇 분 걸립니다 - 완료되면 위 크롤링 진행률에 반영되니,
        잠시 후 새로고침해서 확인해 주세요.
      </p>
      <button type="button" class="btn btn-primary" id="crawl-recent-btn">최근 기사 업데이트 요청</button>
      <p id="crawl-recent-status" role="status" aria-live="polite"></p>
    </section>`}function ie(e){return e.publishedIssues.length===0?`
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
        ${t.thumbnail?`<img src="${c(t.thumbnail)}" alt="" loading="lazy" />`:""}
        <div class="published-item-body">
          <h3>${c(t.title)}</h3>
          <dl>
            <div><dt>공개일</dt><dd>${I(t.published_at||t.updated_at)}</dd></div>
            <div><dt>최종 갱신</dt><dd>${I(t.updated_at)}</dd></div>
            <div><dt>포함 기사 수</dt><dd>${t.source_count}개</dd></div>
          </dl>
          <a href="${c(t.public_url)}" rel="noopener">사이트에서 보기 →</a>
        </div>
      </li>`).join("")}</ul>
    </section>`}function re(e,s){const t=ee[e.status],n=`${s}/manage/preview/${c(se(e))}`;return`
      <li class="issue-row card">
        <div class="issue-row-main">
          <span class="badge" data-tone="${t.tone}">${t.label}</span>
          <span class="issue-row-id">${c(e.issue_id)}</span>
          <span class="issue-row-subject">${c(e.subject)}</span>
        </div>
        <a class="btn btn-primary" href="${n}">미리보기 →</a>
      </li>`}function k(e,s){return e.length===0?'<p class="empty" id="issue-preview-empty">검색 결과가 없습니다.</p>':`<ul class="issue-table">${e.map(t=>re(t,s)).join("")}</ul>`}function M(e,s){if(s<=1)return"";const t=Array.from({length:s},(n,a)=>a+1).map(n=>`<button type="button" class="pagination-link${n===e?" active":""}" data-page="${n}" aria-current="${n===e?"page":"false"}">${n}</button>`).join("");return`
    <nav class="pagination" aria-label="미리보기 목록 페이지 이동">
      <button type="button" class="pagination-link${e<=1?" disabled":""}" data-page="${Math.max(1,e-1)}" aria-disabled="${e<=1}">이전</button>
      ${t}
      <button type="button" class="pagination-link${e>=s?" disabled":""}" data-page="${Math.min(s,e+1)}" aria-disabled="${e>=s}">다음</button>
    </nav>`}function oe(e,s){if(e.allIssues.length===0)return`
      <section>
        <h2>전체 뉴스레터 호 미리보기</h2>
        <p class="empty">등록된 뉴스레터 호가 없습니다.</p>
      </section>`;const t=T(e.allIssues,"id_desc").slice(0,h),n=Math.ceil(e.allIssues.length/h);return`
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
          <select id="issue-preview-sort">${Z.map(i=>`<option value="${i.value}">${i.label}</option>`).join("")}</select>
        </div>
      </div>
      <div id="issue-preview-list">${k(t,s)}</div>
      <div id="issue-preview-pagination">${M(1,n)}</div>
    </section>`}function le(){return`
    <section>
      <h2>바로가기</h2>
      <div class="quicklink-grid">${te.map(s=>`
      <div class="quicklink-card card">
        <span class="quicklink-icon" aria-hidden="true">${s.icon}</span>
        <h3>${s.title}</h3>
        <p>${s.body}</p>
        <a class="btn btn-primary" href="${s.href}">${s.label}</a>
      </div>`).join("")}</div>
    </section>`}function ce(e){return`
    <section>
      <h2>자동 작업 요청</h2>
      <p>
        최근 기사 수집, 특정 기사 재수집, 공개/비공개/보관 전환, 사이트 재배포 같은 작업은
        <code>/admin/</code>의 <strong>운영 요청</strong> 컬렉션에서 양식을 채워 요청할 수
        있습니다. 터미널이나 git을 직접 다루지 않고도 작업을 요청하는 창구이며, 위 "최근 기사
        업데이트" 버튼도 같은 방식으로 요청을 남깁니다. 요청은 GitHub Actions가 자동으로 실행하고
        결과를 기록합니다 (보통 몇 분 내). 예시 호 생성과 테스트 발송만은 안전상 이유로 자동
        실행하지 않으며, 기술 관리자가 직접 처리합니다.
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
        필요하면 <a href="mailto:${c(e)}">${c(e)}</a>로 문의해 주세요.
      </p>
    </section>`}function de(e,s,t){return[ne(e),ae(),ie(e),oe(e,s),le(),ce(t)].join(`
`)}const ue=A(["crawl_recent","crawl_article","build_example_issue","publish_issue","unpublish_issue","archive_issue","redeploy_site","send_test"]),pe=A(["requested","processing","completed","failed","cancelled"]),be=G({request_id:l().min(1),action:ue,target:l().default(""),status:pe,requested_by:l().default(""),requested_at:l().min(1),confirmation:l().default(""),result_summary:l().default(""),result_url:l().default(""),completed_at:l().default("")});function he(e,s=new Date,t=Math.random().toString(36).slice(2,8)){const n=`op-manage-crawl-recent-${s.getTime()}-${t}`;return be.parse({request_id:n,action:"crawl_recent",target:"",status:"requested",requested_by:e,requested_at:s.toISOString(),confirmation:"",result_summary:"",result_url:"",completed_at:""})}async function me(e,s,t,n=fetch){const a=`content/operations/${s.request_id}.json`,i=JSON.stringify(s,null,2);await N(e,a,i,`chore(operations): request ${s.action} via /manage/`,t,n)}const fe="https://swebin-sveltia-auth.swebin-newsletter.workers.dev",w={owner:"swebin-dev",repo:"swebin-newsletter",ref:"main"},ge="swebin.newsletter@gmail.com",g=document.getElementById("manage-status"),_=document.getElementById("manage-dashboard"),u=document.getElementById("login-btn"),m=document.getElementById("logout-btn"),f=document.getElementById("account-label");function d(e){g.innerHTML="";const s=document.createElement("p");s.textContent=e,g.appendChild(s)}function ve(e,s){const t=document.getElementById("issue-preview-search"),n=document.getElementById("issue-preview-sort"),a=document.getElementById("issue-preview-list"),i=document.getElementById("issue-preview-pagination");if(!t||!n||!a||!i)return;let r=1;function p(){const b=X(e,t.value),o=T(b,n.value),y=Math.max(1,Math.ceil(o.length/h));r=Math.min(r,y);const $=(r-1)*h,j=o.slice($,$+h);a.innerHTML=k(j,s),i.innerHTML=M(r,y)}t.addEventListener("input",()=>{r=1,p()}),n.addEventListener("change",()=>{r=1,p()}),i.addEventListener("click",b=>{const o=b.target.closest("button[data-page]");!o||o.classList.contains("disabled")||(r=Number(o.getAttribute("data-page")),p())})}function we(e,s){const t=document.getElementById("crawl-recent-btn"),n=document.getElementById("crawl-recent-status");!t||!n||t.addEventListener("click",async()=>{t.disabled=!0,n.textContent="요청을 제출하는 중...";try{const a=he(s??"manage-dashboard");await me(w,a,e),n.textContent="요청을 제출했습니다. GitHub Actions가 자동으로 처리하며 보통 몇 분 걸립니다 - 잠시 후 이 페이지를 새로고침해서 확인해 주세요."}catch{n.textContent="요청 제출에 실패했습니다. 잠시 후 다시 시도해 주세요."}finally{t.disabled=!1}})}async function R(e){if(d("불러오는 중입니다..."),!await U(w,e)){L(),u.hidden=!1,m.hidden=!0,f.hidden=!0,d("이 저장소에 대한 접근 권한이 없는 계정입니다. 권한이 있는 계정으로 다시 로그인해 주세요.");return}const t=await W(e);t&&(f.textContent=`${t}(으)로 로그인됨`,f.hidden=!1);try{const n=await Y(w,e,window.location.origin);_.innerHTML=de(n,window.location.origin,ge),ve(n.allIssues,window.location.origin),we(e,t),_.hidden=!1,u.hidden=!0,m.hidden=!1,d(""),g.hidden=!0}catch{d("불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.")}}u.addEventListener("click",async()=>{u.disabled=!0,d("로그인 창을 여는 중입니다...");try{const e=await D({workerBaseUrl:fe});await R(e)}catch(e){d(e instanceof Error?e.message:"로그인에 실패했습니다.")}finally{u.disabled=!1}});m.addEventListener("click",()=>{L(),_.hidden=!0,u.hidden=!1,m.hidden=!0,f.hidden=!0,g.hidden=!1,d("로그아웃했습니다. 다시 보려면 로그인해 주세요.")});const E=F();E&&(m.hidden=!1,u.hidden=!0,R(E));
