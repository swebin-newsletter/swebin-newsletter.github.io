import{s as g,i as S,e as A,f as P,a as w,p as C,I as T,G as L,b as i,l as M,c as v,d as R,v as k,g as B}from"./escape-html.CW00gxiH.js";function j(e,t,s){const n=A(e);return{issue_id:e.issue_id,title:e.subject,public_url:`${t}/issues/${n}/`,publication_status:e.status,published_at:e.published_at,updated_at:e.published_at||e.publish_date,...s?{thumbnail:s}:{},source_count:e.articles.length}}async function G(e,t,s){const n=g(e.filter(a=>S(a.status,a.visibility)));return Promise.all(n.map(async a=>j(a,t,await s(a))))}const p=452;function H(e){let t;try{t=JSON.parse(e)}catch{return null}if(!t||typeof t!="object")return null;const s=t,n=Number(s.last_completed_page??0);return Number.isFinite(n)?{lastCompletedPage:n,updatedAt:typeof s.updated_at=="string"?s.updated_at:"",completedCount:Array.isArray(s.completed_source_ids)?s.completed_source_ids.length:0,failedCount:Array.isArray(s.failed_source_ids)?s.failed_source_ids.length:0,targetPage:p,percent:Math.min(100,Math.round(n/p*100)),complete:n>=p}:null}async function D(e,t,s,n){const a=await w(e,`content/issues/${t}/index.md`,s,n),{data:r}=C(a);return T.parse(r)}async function x(e,t,s){try{const n=await w(e,"data/crawl-checkpoint.json",t,s);return H(n)}catch(n){if(n instanceof L&&n.status===404)return null;throw n}}async function N(e,t,s,n=fetch){const a=await P(e,"content/issues",t,n),[r,_]=await Promise.all([Promise.all(a.map(E=>D(e,E,t,n))),x(e,t,n)]),$=g(r),I=await G(r,s,async()=>{});return{crawlProgress:_,allIssues:$,publishedIssues:I}}const q={draft:{label:"초안",tone:"neutral"},review_requested:{label:"검토 요청",tone:"warning"},approved:{label:"승인됨",tone:"info"},sending:{label:"발송 중",tone:"warning"},sent:{label:"발송 완료",tone:"success"},cancelled:{label:"취소됨",tone:"neutral"},ready:{label:"공개 준비",tone:"info"},published:{label:"공개 중",tone:"success"},unpublished:{label:"비공개",tone:"warning"},archived:{label:"보관됨",tone:"neutral"}},O=[{icon:"📝",title:"콘텐츠 관리",body:"기사 편집(제목·요약·썸네일), 뉴스레터 호 작성과 기사 구성, 발행 상태 관리는 모두 /admin/에서 이루어집니다. GitHub 계정으로 로그인해야 하며, 해당 저장소에 접근 권한이 있는 계정만 실제로 내용을 보거나 수정할 수 있습니다.",href:"/admin/",label:"/admin/ 열기"},{icon:"👥",title:"수신인 · 발신인",body:"뉴스레터를 받을 사람 추가/삭제는 /admin-recipients/에서 관리합니다. 테스트 수신과 실제 발송 수신은 서로 다른 플래그로 독립적으로 관리되며, SMTP 비밀번호 등 발신 계정의 민감 정보는 여기서 다루지 않습니다.",href:"/admin-recipients/",label:"/admin-recipients/ 열기"},{icon:"📤",title:"발송",body:"테스트 발송과 실제 발송은 모두 GitHub Actions에서만 실행됩니다. 실제 발송은 이슈 ID와 정확히 일치하는 확인 문구를 직접 입력해야만 실행되는 의도된 이중 확인 절차이며, 이 대시보드의 어떤 조작으로도 건너뛸 수 없습니다.",href:"/admin-send/",label:"/admin-send/ 에서 자세히 보기"}];function b(e){return e?e.slice(0,10):"-"}function U(e){return e.public_slug.trim()||e.issue_id}function F(e){const t=e.crawlProgress,s=t?`<span class="stat-value">${t.lastCompletedPage} / ${t.targetPage} 페이지 (${t.percent}%)</span>
       <span class="stat-sub">수집 기사 ${t.completedCount}개 · 실패/재시도 ${t.failedCount}개 · ${t.complete?"완료":"진행 중"}</span>`:'<span class="stat-value stat-value-muted">기록 없음</span>';return`
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
    </section>`}function K(e){return e.publishedIssues.length===0?`
      <section>
        <h2>현재 공개 중</h2>
        <p>지금 공개 사이트에 실제로 노출되고 있는 뉴스레터 호 목록입니다.</p>
        <p class="empty">현재 공개 중인 뉴스레터 호가 없습니다.</p>
      </section>`:`
    <section>
      <h2>현재 공개 중</h2>
      <p>지금 공개 사이트에 실제로 노출되고 있는 뉴스레터 호 목록입니다.</p>
      <ul class="published-list">${e.publishedIssues.map(s=>`
      <li class="published-item card">
        ${s.thumbnail?`<img src="${i(s.thumbnail)}" alt="" loading="lazy" />`:""}
        <div class="published-item-body">
          <h3>${i(s.title)}</h3>
          <dl>
            <div><dt>공개일</dt><dd>${b(s.published_at||s.updated_at)}</dd></div>
            <div><dt>최종 갱신</dt><dd>${b(s.updated_at)}</dd></div>
            <div><dt>포함 기사 수</dt><dd>${s.source_count}개</dd></div>
          </dl>
          <a href="${i(s.public_url)}" rel="noopener">사이트에서 보기 →</a>
        </div>
      </li>`).join("")}</ul>
    </section>`}function W(e,t){return e.allIssues.length===0?`
      <section>
        <h2>전체 뉴스레터 호 미리보기</h2>
        <p class="empty">등록된 뉴스레터 호가 없습니다.</p>
      </section>`:`
    <section>
      <h2>전체 뉴스레터 호 미리보기</h2>
      <p>
        실제 공개 여부와 무관하게, 모든 뉴스레터 호가 발행되면 어떤 화면으로 보일지 미리 확인할 수
        있습니다. 미리보기 화면은 관리자에게만 보이며, 공개 사이트에는 절대 노출되지 않습니다.
      </p>
      <ul class="issue-table">${e.allIssues.map(n=>{const a=q[n.status],r=`${t}/manage/preview/${i(U(n))}`;return`
      <li class="issue-row card">
        <div class="issue-row-main">
          <span class="badge" data-tone="${a.tone}">${a.label}</span>
          <span class="issue-row-id">${i(n.issue_id)}</span>
          <span class="issue-row-subject">${i(n.subject)}</span>
        </div>
        <a class="btn btn-primary" href="${r}">미리보기 →</a>
      </li>`}).join("")}</ul>
    </section>`}function Q(){return`
    <section>
      <h2>바로가기</h2>
      <div class="quicklink-grid">${O.map(t=>`
      <div class="quicklink-card card">
        <span class="quicklink-icon" aria-hidden="true">${t.icon}</span>
        <h3>${t.title}</h3>
        <p>${t.body}</p>
        <a class="btn btn-primary" href="${t.href}">${t.label}</a>
      </div>`).join("")}</div>
    </section>`}function z(e){return`
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
        필요하면 <a href="mailto:${i(e)}">${i(e)}</a>로 문의해 주세요.
      </p>
    </section>`}function J(e,t,s){return[F(e),K(e),W(e,t),Q(),z(s)].join(`
`)}const V="https://swebin-sveltia-auth.swebin-newsletter.workers.dev",f={owner:"swebin-dev",repo:"swebin-newsletter",ref:"main"},Y="swebin.newsletter@gmail.com",u=document.getElementById("manage-status"),h=document.getElementById("manage-dashboard"),c=document.getElementById("login-btn"),d=document.getElementById("logout-btn"),o=document.getElementById("account-label");function l(e){u.innerHTML="";const t=document.createElement("p");t.textContent=e,u.appendChild(t)}async function y(e){if(l("불러오는 중입니다..."),!await k(f,e)){v(),c.hidden=!1,d.hidden=!0,o.hidden=!0,l("이 저장소에 대한 접근 권한이 없는 계정입니다. 권한이 있는 계정으로 다시 로그인해 주세요.");return}const s=await B(e);s&&(o.textContent=`${s}(으)로 로그인됨`,o.hidden=!1);try{const n=await N(f,e,window.location.origin);h.innerHTML=J(n,window.location.origin,Y),h.hidden=!1,c.hidden=!0,d.hidden=!1,l(""),u.hidden=!0}catch{l("불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.")}}c.addEventListener("click",async()=>{c.disabled=!0,l("로그인 창을 여는 중입니다...");try{const e=await M({workerBaseUrl:V});await y(e)}catch(e){l(e instanceof Error?e.message:"로그인에 실패했습니다.")}finally{c.disabled=!1}});d.addEventListener("click",()=>{v(),h.hidden=!0,c.hidden=!1,d.hidden=!0,o.hidden=!0,u.hidden=!1,l("로그아웃했습니다. 다시 보려면 로그인해 주세요.")});const m=R();m&&(d.hidden=!1,c.hidden=!0,y(m));
