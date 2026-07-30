import{s as C,i as B,e as O,f as q,a as E,p as x,I as H,G as N,b as c,c as A,o as G,d as o,g as D,l as F,h as L,j as U,v as W,k as K}from"./escape-html.B8IRY9eH.js";function J(e,n,t){const s=O(e);return{issue_id:e.issue_id,title:e.subject,public_url:`${n}/issues/${s}/`,publication_status:e.status,published_at:e.published_at,updated_at:e.published_at||e.publish_date,...t?{thumbnail:t}:{},source_count:e.articles.length}}async function Q(e,n,t){const s=C(e.filter(a=>B(a.status)));return Promise.all(s.map(async a=>J(a,n,await t(a))))}const w=452;function V(e){let n;try{n=JSON.parse(e)}catch{return null}if(!n||typeof n!="object")return null;const t=n,s=Number(t.last_completed_page??0);return Number.isFinite(s)?{lastCompletedPage:s,updatedAt:typeof t.updated_at=="string"?t.updated_at:"",completedCount:Array.isArray(t.completed_source_ids)?t.completed_source_ids.length:0,failedCount:Array.isArray(t.failed_source_ids)?t.failed_source_ids.length:0,failedPagesCount:Array.isArray(t.failed_pages)?t.failed_pages.length:0,targetPage:w,percent:Math.min(100,Math.round(s/w*100)),complete:s>=w}:null}function Y(e,n){if(n===null||!Number.isFinite(n))return null;const t=e-n;return t>0?t:null}async function z(e,n,t,s){const a=await E(e,`content/issues/${n}/index.md`,t,s),{data:i}=x(a);return H.parse(i)}async function Z(e,n,t){try{const s=await E(e,"data/crawl-checkpoint.json",n,t);return V(s)}catch(s){if(s instanceof N&&s.status===404)return null;throw s}}async function X(e,n,t,s=fetch){const a=await q(e,"content/issues",n,s),[i,r]=await Promise.all([Promise.all(a.map(l=>z(e,l,n,s))),Z(e,n,s)]),p=C(i),b=await Q(i,t,async()=>{});return{crawlProgress:r,allIssues:p,publishedIssues:b}}const h=20,ee=[{value:"id_desc",label:"최신 호 순"},{value:"id_asc",label:"오래된 호 순"},{value:"status",label:"상태순"},{value:"subject",label:"제목순"}];function T(e,n){const t=[...e];switch(n){case"id_desc":t.sort((s,a)=>a.issue_id.localeCompare(s.issue_id));break;case"id_asc":t.sort((s,a)=>s.issue_id.localeCompare(a.issue_id));break;case"status":t.sort((s,a)=>s.status.localeCompare(a.status)||a.issue_id.localeCompare(s.issue_id));break;case"subject":t.sort((s,a)=>s.subject.localeCompare(a.subject,"ko"));break}return t}function te(e,n){const t=n.trim().toLowerCase();return t===""?e:e.filter(s=>s.issue_id.toLowerCase().includes(t)||s.subject.toLowerCase().includes(t))}const se={published:{label:"공개 중",tone:"success"},unpublished:{label:"비공개",tone:"warning"}},ne=[{icon:"📝",title:"콘텐츠 관리",body:"기사 편집(제목·요약·썸네일), 뉴스레터 호 작성과 기사 구성, 발행 상태 관리는 모두 /admin/에서 이루어집니다. GitHub 계정으로 로그인해야 하며, 해당 저장소에 접근 권한이 있는 계정만 실제로 내용을 보거나 수정할 수 있습니다.",href:"/admin/",label:"/admin/ 열기"},{icon:"👥",title:"수신인 · 발신인",body:"뉴스레터를 받을 사람 추가/삭제는 /admin-recipients/에서 관리합니다. 테스트 수신과 실제 발송 수신은 서로 다른 플래그로 독립적으로 관리되며, SMTP 비밀번호 등 발신 계정의 민감 정보는 여기서 다루지 않습니다.",href:"/admin-recipients/",label:"/admin-recipients/ 열기"}];function I(e){return e?e.slice(0,10):"-"}function ae(e){return e.public_slug.trim()||e.issue_id}function ie(e,n=null){const t=e.crawlProgress;let s;if(!t)s='<span class="stat-value stat-value-muted">기록 없음</span>';else if(t.complete){const a=n?` <span class="stat-delta">+${n}</span>`:"";s=`<span class="stat-value">총 게시물 ${t.completedCount}개${a}</span>
       <span class="stat-sub">부서진 페이지 ${t.failedPagesCount}개 · 실패 기사 ${t.failedCount}개 · 수집 완료</span>`}else s=`<span class="stat-value">${t.lastCompletedPage} / ${t.targetPage} 페이지 (${t.percent}%)</span>
       <span class="stat-sub">총 게시물 ${t.completedCount}개 · 부서진 페이지 ${t.failedPagesCount}개 · 실패 기사 ${t.failedCount}개 · 진행 중</span>`;return`
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
          ${s}
        </div>
      </div>
    </section>`}function re(){return`
    <section>
      <h2>최근 기사 업데이트</h2>
      <p>
        버튼을 누르면 원문 사이트에서 새로 올라온 기사를 자동으로 가져오도록 요청합니다. GitHub
        Actions가 자동으로 실행하며 보통 몇 분 걸립니다 - 완료되면 위 크롤링 진행률에 반영되니,
        잠시 후 새로고침해서 확인해 주세요.
      </p>
      <button type="button" class="btn btn-primary" id="crawl-recent-btn">
        <span class="btn-spinner" aria-hidden="true" hidden></span>
        최근 기사 업데이트
      </button>
      <p id="crawl-recent-status" role="status" aria-live="polite"></p>
    </section>`}function le(e){return e.publishedIssues.length===0?`
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
    </section>`}function oe(e,n){const t=se[e.status],s=`${n}/manage/preview/${c(ae(e))}`;return`
      <li class="issue-row card">
        <div class="issue-row-main">
          <span class="badge" data-tone="${t.tone}">${t.label}</span>
          <span class="issue-row-id">${c(e.issue_id)}</span>
          <span class="issue-row-subject">${c(e.subject)}</span>
        </div>
        <a class="btn btn-primary" href="${s}">미리보기 →</a>
      </li>`}function R(e,n){return e.length===0?'<p class="empty" id="issue-preview-empty">검색 결과가 없습니다.</p>':`<ul class="issue-table">${e.map(t=>oe(t,n)).join("")}</ul>`}function P(e,n){if(n<=1)return"";const t=Array.from({length:n},(s,a)=>a+1).map(s=>`<button type="button" class="pagination-link${s===e?" active":""}" data-page="${s}" aria-current="${s===e?"page":"false"}">${s}</button>`).join("");return`
    <nav class="pagination" aria-label="미리보기 목록 페이지 이동">
      <button type="button" class="pagination-link${e<=1?" disabled":""}" data-page="${Math.max(1,e-1)}" aria-disabled="${e<=1}">이전</button>
      ${t}
      <button type="button" class="pagination-link${e>=n?" disabled":""}" data-page="${Math.min(n,e+1)}" aria-disabled="${e>=n}">다음</button>
    </nav>`}function ce(e,n){if(e.allIssues.length===0)return`
      <section>
        <h2>전체 뉴스레터 호 미리보기</h2>
        <p class="empty">등록된 뉴스레터 호가 없습니다.</p>
      </section>`;const t=T(e.allIssues,"id_desc").slice(0,h),s=Math.ceil(e.allIssues.length/h);return`
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
          <select id="issue-preview-sort">${ee.map(i=>`<option value="${i.value}">${i.label}</option>`).join("")}</select>
        </div>
      </div>
      <div id="issue-preview-list">${R(t,n)}</div>
      <div id="issue-preview-pagination">${P(1,s)}</div>
    </section>`}function de(){return`
    <section>
      <h2>바로가기</h2>
      <div class="quicklink-grid">${ne.map(n=>`
      <div class="quicklink-card card">
        <span class="quicklink-icon" aria-hidden="true">${n.icon}</span>
        <h3>${n.title}</h3>
        <p>${n.body}</p>
        <a class="btn btn-primary" href="${n.href}">${n.label}</a>
      </div>`).join("")}</div>
    </section>`}function ue(e){return`
    <section>
      <h2>자동 작업 요청</h2>
      <p>
        최근 기사 수집, 특정 기사 재수집, 공개/비공개 전환, 사이트 재배포 같은 작업은
        <code>/admin/</code>의 <strong>운영 요청</strong> 컬렉션에서 양식을 채워 요청할 수
        있습니다. 터미널이나 git을 직접 다루지 않고도 작업을 요청하는 창구이며, 위 "최근 기사
        업데이트" 버튼도 같은 방식으로 요청을 남깁니다. 요청은 GitHub Actions가 자동으로 실행하고
        결과를 기록합니다 (보통 몇 분 내). 예시 호 생성과 테스트 발송만은 안전상 이유로 자동
        실행하지 않으며, 기술 관리자가 직접 처리합니다.
      </p>
    </section>
    <section>
      <h2>공개 · 비공개</h2>
      <p>뉴스레터 호는 발행 후에도 다음 두 가지 공개 상태를 오갈 수 있습니다.</p>
      <ul>
        <li><strong>공개(published)</strong> - 공개 사이트의 발행 목록과 상세 페이지에 노출됩니다.</li>
        <li><strong>비공개(unpublished)</strong> - 다음 배포부터 공개 사이트에서 완전히 사라집니다. 다시 공개로 되돌릴 수 있습니다.</li>
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
    </section>`}function pe(e,n,t,s=null){return[ie(e,s),re(),le(e),ce(e,n),de(),ue(t)].join(`
`)}const be=A(["crawl_recent","crawl_article","build_example_issue","publish_issue","unpublish_issue","redeploy_site","send_test"]),he=A(["requested","processing","completed","failed","cancelled"]),me=G({request_id:o().min(1),action:be,target:o().default(""),status:he,requested_by:o().default(""),requested_at:o().min(1),confirmation:o().default(""),result_summary:o().default(""),result_url:o().default(""),completed_at:o().default("")});function fe(e,n=new Date,t=Math.random().toString(36).slice(2,8)){const s=`op-manage-crawl-recent-${n.getTime()}-${t}`;return me.parse({request_id:s,action:"crawl_recent",target:"",status:"requested",requested_by:e,requested_at:n.toISOString(),confirmation:"",result_summary:"",result_url:"",completed_at:""})}async function ge(e,n,t,s=fetch){const a=`content/operations/${n.request_id}.json`,i=JSON.stringify(n,null,2);await D(e,a,i,`chore(operations): request ${n.action} via /manage/`,t,s)}const k="swebin-manage-last-completed-count";function we(){try{const e=window.localStorage.getItem(k);if(e===null)return null;const n=Number(e);return Number.isFinite(n)?n:null}catch{return null}}function ve(e){try{window.localStorage.setItem(k,String(e))}catch{}}const _e="https://swebin-sveltia-auth.swebin-newsletter.workers.dev",v={owner:"swebin-dev",repo:"swebin-newsletter",ref:"main"},ye="swebin.newsletter@gmail.com",g=document.getElementById("manage-status"),_=document.getElementById("manage-dashboard"),u=document.getElementById("login-btn"),m=document.getElementById("logout-btn"),f=document.getElementById("account-label");function d(e){g.innerHTML="";const n=document.createElement("p");n.textContent=e,g.appendChild(n)}function $e(e,n){const t=document.getElementById("issue-preview-search"),s=document.getElementById("issue-preview-sort"),a=document.getElementById("issue-preview-list"),i=document.getElementById("issue-preview-pagination");if(!t||!s||!a||!i)return;let r=1;function p(){const b=te(e,t.value),l=T(b,s.value),y=Math.max(1,Math.ceil(l.length/h));r=Math.min(r,y);const $=(r-1)*h,j=l.slice($,$+h);a.innerHTML=R(j,n),i.innerHTML=P(r,y)}t.addEventListener("input",()=>{r=1,p()}),s.addEventListener("change",()=>{r=1,p()}),i.addEventListener("click",b=>{const l=b.target.closest("button[data-page]");!l||l.classList.contains("disabled")||(r=Number(l.getAttribute("data-page")),p())})}function Ie(e,n){const t=document.getElementById("crawl-recent-btn"),s=document.getElementById("crawl-recent-status"),a=t?.querySelector(".btn-spinner");!t||!s||t.addEventListener("click",async()=>{t.disabled=!0,a&&(a.hidden=!1),s.textContent="요청을 제출하는 중...";try{const i=fe(n??"manage-dashboard");await ge(v,i,e),s.textContent="요청을 제출했습니다. GitHub Actions가 자동으로 처리하며 보통 몇 분 걸립니다 - 잠시 후 이 페이지를 새로고침해서 확인해 주세요."}catch{s.textContent="요청 제출에 실패했습니다. 잠시 후 다시 시도해 주세요."}finally{t.disabled=!1,a&&(a.hidden=!0)}})}async function M(e){if(d("불러오는 중입니다..."),!await W(v,e)){L(),u.hidden=!1,m.hidden=!0,f.hidden=!0,d("이 저장소에 대한 접근 권한이 없는 계정입니다. 권한이 있는 계정으로 다시 로그인해 주세요.");return}const t=await K(e);t&&(f.textContent=`${t}(으)로 로그인됨`,f.hidden=!1);try{const s=await X(v,e,window.location.origin),a=we(),i=s.crawlProgress?Y(s.crawlProgress.completedCount,a):null;s.crawlProgress&&ve(s.crawlProgress.completedCount),_.innerHTML=pe(s,window.location.origin,ye,i),$e(s.allIssues,window.location.origin),Ie(e,t),_.hidden=!1,u.hidden=!0,m.hidden=!1,d(""),g.hidden=!0}catch{d("불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.")}}u.addEventListener("click",async()=>{u.disabled=!0,d("로그인 창을 여는 중입니다...");try{const e=await F({workerBaseUrl:_e});await M(e)}catch(e){d(e instanceof Error?e.message:"로그인에 실패했습니다.")}finally{u.disabled=!1}});m.addEventListener("click",()=>{L(),_.hidden=!0,u.hidden=!1,m.hidden=!0,f.hidden=!0,g.hidden=!1,d("로그아웃했습니다. 다시 보려면 로그인해 주세요.")});const S=U();S&&(m.hidden=!1,u.hidden=!0,M(S));
