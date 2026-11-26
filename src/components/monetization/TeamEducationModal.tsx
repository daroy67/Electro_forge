import React, { useState } from "react";
import {
  X,
  Users,
  GraduationCap,
  Building2,
  Mail,
  Send,
  CheckCircle2,
  Layers,
  Award,
  Sparkles,
  BarChart3,
  Check,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamEducationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { tr } = useLanguage();
  const [activeTab, setActiveTab] = useState<"inquiry" | "dashboard_demo">("inquiry");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [seats, setSeats] = useState<string>("15");
  const [role, setRole] = useState<string>("teacher");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !institution.trim()) return;
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                {tr("КОМАНДЫ И ОБРАЗОВАНИЕ", "TEAMS & EDUCATION")}
              </span>
              <h2 className="text-lg font-bold text-white">
                {tr("ElectroForge для ВУЗов и Инженерных Команд", "ElectroForge for Universities & Engineering Teams")}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-2">
          <button
            onClick={() => setActiveTab("inquiry")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "inquiry"
                ? "bg-indigo-500 text-white shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{tr("Запросить лицензии", "Request Licenses")}</span>
          </button>
          <button
            onClick={() => setActiveTab("dashboard_demo")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "dashboard_demo"
                ? "bg-indigo-500 text-white shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{tr("Демо-панель преподавателя", "Instructor Dashboard Demo")}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === "inquiry" && (
            <>
              {isSubmitted ? (
                <div className="p-8 text-center space-y-3 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {tr("Заявка успешно отправлена!", "Inquiry Successfully Submitted!")}
                  </h3>
                  <p className="text-slate-300 text-xs max-w-md mx-auto">
                    {tr(
                      `Спасибо, ${fullName || "коллега"}! Мы свяжемся с вами по адресу `,
                      `Thank you, ${fullName || "Colleague"}! We will reach out to `
                    )}
                    <span className="text-sky-300 font-mono font-semibold">{email}</span>{" "}
                    {tr(
                      "в течение 24 часов и предоставим пилотный доступ для кафедры/команды.",
                      "within 24 hours to set up your institutional pilot access."
                    )}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab("dashboard_demo")}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                    >
                      {tr("Посмотреть интерактивное демо кабинета", "View Interactive Dashboard Demo")}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        {tr("Контактное лицо", "Contact Name")}
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={tr("Проф. Иван Иванов", "Prof. Alex Smith")}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        {tr("Рабочий / Академический Email", "Institutional / Academic Email")} <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="teacher@university.edu"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        {tr("Организация / Университет / Школа", "Institution / University / School")} <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder={tr("Технический университет / Кафедра микроэлектроники", "MIT / Stanford / Technical University")}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        {tr("Количество рабочих мест (от 5 шт.)", "Number of Seats (5+ seats)")}
                      </label>
                      <select
                        value={seats}
                        onChange={(e) => setSeats(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                      >
                        <option value="5-10">{tr("5 – 10 лицензий (Малая группа)", "5 – 10 seats (Small Lab)")}</option>
                        <option value="15">{tr("15 – 30 лицензий (Класс / Академическая группа)", "15 – 30 seats (Class / Course)")}</option>
                        <option value="50">{tr("50 – 100 лицензий (Поток студентов)", "50 – 100 seats (Department)")}</option>
                        <option value="100+">{tr("100+ мест (Факультет / Предприятие)", "100+ seats (Enterprise / Campus)")}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {tr("Комментарии к заявке или задачи обучения", "Curriculum Requirements & Comments")}
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={tr(
                        "Например: планируем проводить лабораторные работы по схемотехнике и физике...",
                        "E.g., planning electronics & physics lab practicum for undergraduate courses..."
                      )}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="text-[11px] text-slate-300">
                      {tr(
                        "В командный тариф входит: централизованный кабинет преподавателя, назначение лабораторных работ, экспорт отчетов студентов в PDF и неограниченный доступ ко всем 69+ деталям.",
                        "Team plan includes: instructor LMS dashboard, automated student grading, PDF reports export, and unrestricted access to all 69+ physical components."
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    >
                      {tr("Отмена", "Cancel")}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{tr("Отправить заявку", "Submit Request")}</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {activeTab === "dashboard_demo" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                <div>
                  <div className="font-bold text-white text-xs">
                    {tr("Интерактивное превью: Кабинет кафедры «Микроэлектроника»", "Interactive Preview: Department of Microelectronics")}
                  </div>
                  <div className="text-[11px] text-indigo-300">
                    {tr("Группа Э-21 • 24 студента • 3 активных лабораторных задания", "Group EE-21 • 24 Students • 3 Active Practicums")}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/30">
                  {tr("ДЕМО-РЕЖИМ", "DEMO MODE")}
                </span>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-base font-mono font-bold text-white">92%</div>
                  <div className="text-[10px] text-slate-400">{tr("Сдали лаб. №1 (Закон Ома)", "Completed Lab #1 (Ohm's Law)")}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-base font-mono font-bold text-emerald-400">18 / 24</div>
                  <div className="text-[10px] text-slate-400">{tr("Схемы прошли проверку", "Circuits Passed Auto-test")}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-base font-mono font-bold text-sky-400">3 {tr("ошибки", "bugs")}</div>
                  <div className="text-[10px] text-slate-400">{tr("Перегрев резистора 0.25Вт", "0.25W Resistor Overheat")}</div>
                </div>
              </div>

              {/* Student list table demo */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
                <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold uppercase">
                  <span>{tr("Студент", "Student")}</span>
                  <span>{tr("Статус схемы", "Circuit Status")}</span>
                  <span>{tr("Оценка автотеста", "Auto-grade")}</span>
                </div>
                <div className="divide-y divide-slate-800/60 text-[11px]">
                  {[
                    { name: tr("Алексей Смирнов", "Alex Rivera"), status: tr("Собрана цепь с делителем", "Voltage divider constructed"), grade: "100/100", ok: true },
                    { name: tr("Мария Ковалева", "Maria Chen"), status: tr("КЗ на шине 5V (исправлено)", "5V short-circuit (resolved)"), grade: "95/100", ok: true },
                    { name: tr("Дмитрий Попов", "David Kim"), status: tr("В процессе сборки усилителя", "Assembling op-amp amplifier"), grade: "60/100", ok: false },
                    { name: tr("Артем Волков", "Arthur Miller"), status: tr("Сгорел светодиод (нет резистора)", "LED blown (missing resistor)"), grade: "40/100", ok: false },
                  ].map((s, idx) => (
                    <div key={idx} className="px-3 py-2 flex items-center justify-between">
                      <div className="font-medium text-slate-200">{s.name}</div>
                      <div className="text-slate-400 text-[10px]">{s.status}</div>
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                          s.ok
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {s.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setActiveTab("inquiry")}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  {tr("Запросить доступ для вашей организации →", "Request Access for Your Team →")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
