const schedule = {
  "Senin": ["MP RPL", "PKKRPL", "KK"],
  "Selasa": ["MTK", "BK", "Pendidikan Pancasila", "PABP"],
  "Rabu": ["KK", "RPL"],
  "Kamis": ["KK", "RPL"],
  "Jumat": ["Bahasa Indonesia", "Bahasa Inggris"]
};

const defaultTasks = [
  {id:1,title:"Membuat Project Web",subject:"MP RPL",date:addDays(1),priority:"high",description:"Membuat project website task management.",done:false},
  {id:2,title:"Latihan Soal",subject:"MTK",date:addDays(2),priority:"medium",description:"Mengerjakan latihan soal matematika.",done:false},
  {id:3,title:"Laporan Praktik",subject:"PKKRPL",date:addDays(3),priority:"high",description:"Menyelesaikan laporan praktik.",done:false},
  {id:4,title:"Tugas Bahasa Inggris",subject:"Bahasa Inggris",date:addDays(5),priority:"low",description:"Membuat tugas Bahasa Inggris.",done:true}
];

let tasks = JSON.parse(localStorage.getItem("taskku_tasks")) || defaultTasks;
let currentDate = new Date();
let bigCurrentDate = new Date();

function addDays(n){
  const d=new Date();
  d.setDate(d.getDate()+n);
  return formatDate(d);
}
function formatDate(d){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function parseDate(s){ const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); }
function save(){localStorage.setItem("taskku_tasks",JSON.stringify(tasks));}
function escapeHtml(str=""){return str.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

function priorityText(p){return p==="high"?"Tinggi":p==="medium"?"Sedang":"Rendah";}
function dateText(s){return parseDate(s).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});}
function daysUntil(s){
  const a=new Date();a.setHours(0,0,0,0);
  const b=parseDate(s);b.setHours(0,0,0,0);
  return Math.ceil((b-a)/86400000);
}

function renderStats(){
  const total=tasks.length,done=tasks.filter(t=>t.done).length,pending=total-done,high=tasks.filter(t=>t.priority==="high"&&!t.done).length;
  document.getElementById("totalCount").textContent=total;
  document.getElementById("doneCount").textContent=done;
  document.getElementById("pendingCount").textContent=pending;
  document.getElementById("highCount").textContent=high;
  document.getElementById("legendDone").textContent=done;
  document.getElementById("legendPending").textContent=pending;
  document.getElementById("legendTotal").textContent=total;
  const pct=total?Math.round(done/total*100):0;
  document.getElementById("progressPercent").textContent=pct+"%";
  document.getElementById("bigProgressPercent").textContent=pct+"%";
  document.querySelector(".donut").style.background=`conic-gradient(#3b82f6 ${pct*3.6}deg,#dce6f6 ${pct*3.6}deg)`;
  document.querySelector(".big-donut").style.background=`conic-gradient(#3b82f6 ${pct*3.6}deg,#dce6f6 ${pct*3.6}deg)`;
  document.getElementById("progressBar").style.width=pct+"%";
  document.getElementById("progressText").textContent=total?`${done} dari ${total} tugas sudah selesai.`:"Belum ada tugas.";
  document.getElementById("notificationDot").style.display=tasks.some(t=>!t.done&&daysUntil(t.date)<=2)?"block":"none";
}

function renderSchedule(){
  const names=["Senin","Selasa","Rabu","Kamis","Jumat"];
  const today=new Date().getDay();
  const todayName=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][today];
  document.getElementById("todayLabel").textContent=`Hari ini: ${todayName}`;
  document.getElementById("scheduleGrid").innerHTML=names.map(day=>`
    <div class="day-box ${day===todayName?"today":""}">
      <div class="day-name">${day}</div>
      <ul>${schedule[day].map(x=>`<li>${x}</li>`).join("")}</ul>
    </div>`).join("");
}

function calendarCells(date, targetId, big=false){
  const year=date.getFullYear(),month=date.getMonth();
  const first=new Date(year,month,1);
  const start=(first.getDay()+6)%7;
  const last=new Date(year,month+1,0).getDate();
  const prevLast=new Date(year,month,0).getDate();
  let html="";
  for(let i=0;i<42;i++){
    const day=i-start+1;
    let cellDate,number,muted=false;
    if(day<1){number=prevLast+day;cellDate=new Date(year,month-1,number);muted=true}
    else if(day>last){number=day-last;cellDate=new Date(year,month+1,number);muted=true}
    else{number=day;cellDate=new Date(year,month,number)}
    const dateStr=formatDate(cellDate);
    const has=tasks.some(t=>t.date===dateStr&&!t.done);
    const today=dateStr===formatDate(new Date());
    if(big){
      const list=tasks.filter(t=>t.date===dateStr&&!t.done).slice(0,2);
      html+=`<div class="calendar-cell ${muted?"muted":""} ${today?"today":""}">
        <div class="date-number">${number}</div>${list.map(t=>`<div class="calendar-task">${escapeHtml(t.title)}</div>`).join("")}
      </div>`;
    }else{
      html+=`<span class="${muted?"":today?"today":""} ${has?"has-task":""}">${number}</span>`;
    }
  }
  document.getElementById(targetId).innerHTML=html;
}

function renderCalendars(){
  const month=currentDate.toLocaleDateString("id-ID",{month:"long",year:"numeric"});
  document.getElementById("monthTitle").textContent=month;
  calendarCells(currentDate,"calendarDays");
  const bigMonth=bigCurrentDate.toLocaleDateString("id-ID",{month:"long",year:"numeric"});
  document.getElementById("bigMonthTitle").textContent=bigMonth;
  calendarCells(bigCurrentDate,"bigCalendarDays",true);
}

function taskRow(t){
  return `<div class="task-row">
    <i class="priority-dot ${t.priority}"></i>
    <div class="task-info"><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.subject)} • ${dateText(t.date)}</small></div>
    <span class="badge priority-${t.priority}">${priorityText(t.priority)}</span>
  </div>`;
}
function renderDeadlines(){
  const list=tasks.filter(t=>!t.done).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);
  document.getElementById("deadlineList").innerHTML=list.length?list.map(taskRow).join(""):`<div class="empty">🎉 Tidak ada tugas yang mendekati deadline.</div>`;
}

function renderTasks(){
  const search=document.getElementById("searchTask").value.toLowerCase();
  const priority=document.getElementById("filterPriority").value;
  const status=document.getElementById("filterStatus").value;
  let filtered=tasks.filter(t=>
    (t.title.toLowerCase().includes(search)||t.subject.toLowerCase().includes(search)) &&
    (priority==="all"||t.priority===priority) &&
    (status==="all"||(status==="done"&&t.done)||(status==="pending"&&!t.done))
  ).sort((a,b)=>a.date.localeCompare(b.date));
  document.getElementById("allTasks").innerHTML=filtered.length?filtered.map(t=>`
    <div class="task-card">
      <button class="check-btn ${t.done?"done":""}" onclick="toggleTask(${t.id})">${t.done?"✓":""}</button>
      <div class="task-card-main">
        <h3 class="${t.done?"done-text":""}">${escapeHtml(t.title)}</h3>
        <div class="task-meta">
          <span class="badge">${escapeHtml(t.subject)}</span>
          <span class="badge priority-${t.priority}">${priorityText(t.priority)}</span>
          <span class="badge">📅 ${dateText(t.date)}</span>
          ${!t.done&&daysUntil(t.date)<=2?`<span class="badge priority-high">⚠ Mendekati deadline</span>`:""}
        </div>
      </div>
      <div class="actions">
        <button class="small-btn" onclick="editTask(${t.id})">✏</button>
        <button class="small-btn delete-btn" onclick="deleteTask(${t.id})">🗑</button>
      </div>
    </div>`).join(""):`<div class="empty">Tidak ada tugas yang sesuai.</div>`;
}

function renderProgress(){
  const sorted=[...tasks].sort((a,b)=>Number(a.done)-Number(b.done));
  document.getElementById("progressTaskList").innerHTML=sorted.length?sorted.map(t=>`
    <div class="task-card">
      <button class="check-btn ${t.done?"done":""}" onclick="toggleTask(${t.id})">${t.done?"✓":""}</button>
      <div class="task-card-main"><h3 class="${t.done?"done-text":""}">${escapeHtml(t.title)}</h3>
      <div class="task-meta"><span class="badge">${escapeHtml(t.subject)}</span><span class="badge">${t.done?"Selesai":"Belum selesai"}</span></div></div>
    </div>`).join(""):`<div class="empty">Belum ada tugas.</div>`;
}

function renderNotifications(){
  const list=tasks.filter(t=>!t.done).sort((a,b)=>a.date.localeCompare(b.date));
  let html="";
  list.forEach(t=>{
    const d=daysUntil(t.date);
    if(d<0) html+=`<div class="notification danger"><h3>🚨 Deadline terlewat: ${escapeHtml(t.title)}</h3><p>${escapeHtml(t.subject)} • Deadline ${dateText(t.date)}.</p></div>`;
    else if(d<=2) html+=`<div class="notification warning"><h3>⏰ Deadline semakin dekat: ${escapeHtml(t.title)}</h3><p>${escapeHtml(t.subject)} • ${d===0?"Deadline hari ini":d===1?"Deadline besok":`Deadline ${d} hari lagi`}.</p></div>`;
  });
  if(!html) html=`<div class="notification"><h3>🔔 Semua aman!</h3><p>Tidak ada tugas yang membutuhkan perhatian khusus saat ini.</p></div>`;
  document.getElementById("notificationList").innerHTML=html;
}

function refresh(){
  save();renderStats();renderSchedule();renderCalendars();renderDeadlines();renderTasks();renderProgress();renderNotifications();
}

function openModal(task=null){
  document.getElementById("taskModal").classList.remove("hidden");
  document.getElementById("modalTitle").textContent=task?"Edit Tugas":"Tambah Tugas";
  document.getElementById("taskId").value=task?.id||"";
  document.getElementById("taskTitle").value=task?.title||"";
  document.getElementById("taskSubject").value=task?.subject||"";
  document.getElementById("taskDate").value=task?.date||formatDate(new Date());
  document.getElementById("taskPriority").value=task?.priority||"medium";
  document.getElementById("taskDescription").value=task?.description||"";
}
function closeModal(){document.getElementById("taskModal").classList.add("hidden");}

function toggleTask(id){const t=tasks.find(x=>x.id===id);if(t){t.done=!t.done;refresh()}}
function editTask(id){const t=tasks.find(x=>x.id===id);if(t)openModal(t)}
function deleteTask(id){if(confirm("Hapus tugas ini?")){tasks=tasks.filter(t=>t.id!==id);refresh()}}

document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.page)));
document.querySelectorAll("[data-page-target]").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.pageTarget)));

function showPage(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));
  document.getElementById(page).classList.add("active-page");
  document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.page===page));
  const titles={dashboard:"Selamat Datang 👋",tasks:"Kelola Tugas",calendar:"Kalender & Jadwal",progress:"Progress Tugas",notifications:"Notifikasi"};
  document.getElementById("pageTitle").textContent=titles[page];
  window.scrollTo({top:0,behavior:"smooth"});
}

document.getElementById("addTaskBtn").onclick=()=>openModal();
document.getElementById("addTaskBtn2").onclick=()=>openModal();
document.getElementById("closeModal").onclick=closeModal;
document.getElementById("taskModal").addEventListener("click",e=>{if(e.target.id==="taskModal")closeModal()});
document.getElementById("notificationBtn").onclick=()=>showPage("notifications");

document.getElementById("taskForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=document.getElementById("taskId").value;
  const data={
    id:id?Number(id):Date.now(),
    title:document.getElementById("taskTitle").value.trim(),
    subject:document.getElementById("taskSubject").value,
    date:document.getElementById("taskDate").value,
    priority:document.getElementById("taskPriority").value,
    description:document.getElementById("taskDescription").value.trim(),
    done:id?tasks.find(t=>t.id===Number(id)).done:false
  };
  if(id) tasks=tasks.map(t=>t.id===Number(id)?data:t); else tasks.push(data);
  closeModal();refresh();showPage("tasks");
});

["searchTask","filterPriority","filterStatus"].forEach(id=>document.getElementById(id).addEventListener("input",renderTasks));
document.getElementById("prevMonth").onclick=()=>{currentDate.setMonth(currentDate.getMonth()-1);renderCalendars()};
document.getElementById("nextMonth").onclick=()=>{currentDate.setMonth(currentDate.getMonth()+1);renderCalendars()};
document.getElementById("bigPrev").onclick=()=>{bigCurrentDate.setMonth(bigCurrentDate.getMonth()-1);renderCalendars()};
document.getElementById("bigNext").onclick=()=>{bigCurrentDate.setMonth(bigCurrentDate.getMonth()+1);renderCalendars()};

refresh();
