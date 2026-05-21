const fs = require('fs');

const premiumUI = `  return (
    <Layout>
      {/* 
        Container constraints:
        Removed min-h-screen to let Layout handle height. 
        Removed hard bg colors to let the layout's background show through.
        Added py-6 px-4 sm:px-6 lg:px-8 to properly pad inside the dashboard.
      */}
      <div className="w-full h-full font-sans animate-in fade-in duration-500 max-w-7xl mx-auto">
        
        {/* PREMIUM ENTERPRISE TOP NAVBAR (Glassmorphism) */}
        <div className="bg-white/50 dark:bg-[#0f172a]/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 sm:px-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-slate-900 dark:text-white leading-tight tracking-tight">AI Resume Studio</h1>
              <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Multi-page PDF Engine & Optimization</p>
            </div>
          </div>
          
          {/* Minimalist Segmented Stepper */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/50 dark:border-slate-800/50 overflow-x-auto w-full md:w-auto shadow-inner">
            {STEPS.map((s, i) => {
              const active = step === s.num;
              const done = step > s.num;
              return (
                <div key={s.num} onClick={() => done && setStep(s.num)}
                  className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap \${done ? 'cursor-pointer' : 'cursor-default'} \${
                    active 
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700/50' 
                      : done
                        ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                        : 'text-slate-400 dark:text-slate-600'
                  }\`}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <s.icon className={\`w-3.5 h-3.5 \${active ? 'animate-pulse' : ''}\`} />}
                  {s.label}
                </div>
              )
            })}
          </div>
        </div>

        {/* MAIN WORKSPACE AREA */}
        <div className="flex flex-col w-full h-full relative">
          {loading ? (
            <div className="py-24 flex items-center justify-center flex-col gap-4">
              <div className="w-8 h-8 border-2 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.2)]"></div>
              <span className="text-[14px] font-medium text-slate-500 dark:text-slate-400 animate-pulse">Initializing engine...</span>
            </div>
          ) : (
            <div className="w-full">
              
              {/* ══ STEP 1: SELECT ══ */}
              {step === 1 && (
                <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Select Source Document</h2>
                    <p className="text-[15px] text-slate-500 dark:text-slate-400 max-w-lg mx-auto">Choose an existing profile to analyze, format, and export using our intelligent engine.</p>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-xl overflow-hidden transition-colors duration-300">
                    {resumes.length === 0 ? (
                      <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-800">
                          <AlertOctagon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-2">No profiles found</h3>
                        <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">You need to create a resume in the studio before you can export it.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[500px] overflow-y-auto custom-scrollbar p-2">
                        {resumes.map(r => (
                          <div key={r.id} onClick={() => setSelectedId(r.id)}
                            className={\`p-4 m-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-200 \${
                              selectedId === r.id 
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)]' 
                                : 'bg-transparent border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }\`}>
                            <div className="flex items-center gap-4">
                              <div className={\`w-12 h-12 rounded-xl flex items-center justify-center transition-colors \${
                                selectedId === r.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                              }\`}><FileText className="w-5 h-5" /></div>
                              <div>
                                <h4 className={\`text-[15px] font-bold \${selectedId === r.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}\`}>{r.title}</h4>
                                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold tracking-wider uppercase">{r.fileType || 'PDF'}</span>
                                  {new Date(r.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors \${
                              selectedId === r.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-700'
                            }\`}>
                              {selectedId === r.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-6 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                      <button 
                        className="w-full bg-slate-900 dark:bg-indigo-600 hover:opacity-90 dark:hover:bg-indigo-500 text-white text-[15px] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20 dark:shadow-indigo-900/20"
                        onClick={parseAndAnalyze} disabled={parsing || !selectedId}>
                        {parsing ? <><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"/> Executing AI Analysis...</> : <><Wand2 className="w-5 h-5" /> Run AI Analysis</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 2: AI OPTIMIZATION ══ */}
              {step === 2 && editData && (
                <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Document Analysis</h2>
                    <p className="text-[15px] text-slate-500 dark:text-slate-400">Review structural issues identified by our AI before moving to layout.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT PANEL: PROFILE SUMMARY */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 rounded-2xl flex items-center justify-center font-bold text-2xl mb-5 shadow-inner border border-indigo-200/50 dark:border-indigo-700/30">
                          {editData.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <h4 className="text-[17px] font-bold text-slate-900 dark:text-white truncate mb-1">{editData.name || 'Unknown'}</h4>
                        <p className="text-[14px] text-slate-500 dark:text-slate-400 truncate mb-8">{editData.email || 'No email'}</p>
                        
                        <div className="space-y-4">
                          {[
                            { k: 'Professional Summary', v: editData.summary?.length > 20 },
                            { k: \`Education (\${editData.education?.filter(e=>e.institution).length || 0})\`, v: editData.education?.some(e=>e.institution) },
                            { k: \`Experience (\${editData.experience?.length || 0})\`, v: editData.experience?.length > 0 },
                            { k: \`Projects (\${editData.projects?.length || 0})\`, v: editData.projects?.length > 0 },
                            { k: 'Technical Skills', v: Object.values(editData.skills || {}).some(v=>v) },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-[14px] font-medium group">
                              <span className="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{s.k}</span>
                              {s.v ? <CheckCircle2 className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"/> : <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center"><X className="w-3 h-3 text-rose-500"/></div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL: AI SUGGESTIONS */}
                    <div className="lg:col-span-2">
                      <div className="bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-xl flex flex-col h-full min-h-[500px]">
                        <div className="border-b border-slate-200 dark:border-slate-800/80 px-6 py-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-t-3xl flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Lightbulb className="w-4 h-4" />
                          </div>
                          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">AI Improvement Suggestions</h3>
                        </div>
                        
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                          {suggestions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-200 dark:border-emerald-500/20">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                              </div>
                              <h4 className="text-[18px] font-bold text-slate-900 dark:text-white mb-2">Excellent Structure</h4>
                              <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-sm">We couldn't find any critical formatting issues. Your resume is well-structured and ready for layout generation.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {suggestions.map((s, i) => {
                                const done = appliedIdx.includes(i);
                                return (
                                  <div key={i} className={\`p-5 rounded-2xl border transition-all duration-300 \${
                                    done 
                                      ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 opacity-70' 
                                      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:bg-slate-800/80'
                                  }\`}>
                                    <div className="flex items-start gap-4">
                                      <div className={\`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 \${
                                        done 
                                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                      }\`}>
                                        {done ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                      </div>
                                      <div className="flex-1">
                                        <h5 className={\`text-[15px] font-bold mb-2 \${done ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-white'}\`}>{s.title}</h5>
                                        {!done && (
                                          <>
                                            <p className="text-[14px] text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{s.detail}</p>
                                            <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[13px] text-slate-700 dark:text-slate-300 mb-4 font-mono leading-relaxed">
                                              <span className="text-indigo-500 dark:text-indigo-400 font-bold mr-2 uppercase tracking-wider text-[11px]">Proposed Fix:</span>
                                              {s.fix}
                                            </div>
                                            <button onClick={() => applySuggestion(s, i)} disabled={applyingIdx === i}
                                              className="bg-slate-900 dark:bg-white hover:opacity-90 text-white dark:text-slate-900 text-[13px] font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm">
                                              {applyingIdx === i ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/> Applying...</> : 'Apply Recommendation'}
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-3xl flex justify-between items-center">
                           <button className="text-[14px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2" onClick={() => setStep(1)}>Go Back</button>
                           <button className="bg-indigo-600 text-white text-[14px] font-bold px-8 py-3 rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20" onClick={() => setStep(3)}>Proceed to Layouts</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 3: TEMPLATES ══ */}
              {step === 3 && (
                <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Architecture Layout</h2>
                    <p className="text-[15px] text-slate-500 dark:text-slate-400">Select a foundational structure. You can switch layouts dynamically in the editor.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {TEMPLATES.map(t => (
                      <div key={t.id} onClick={() => setTemplate(t.id)}
                        className={\`bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl p-5 rounded-3xl cursor-pointer transition-all duration-300 border-2 group relative \${
                          template === t.id 
                            ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-[1.02]' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl hover:scale-[1.01]'
                        }\`}>
                        <div className="aspect-[1/1.414] w-full bg-slate-50 dark:bg-[#09090b] rounded-2xl mb-5 relative overflow-hidden flex flex-col pt-4 px-4 border border-slate-100 dark:border-slate-800/80 transition-colors">
                          <div className={\`w-full h-2 mb-3 rounded-full \${t.id === 'modern' ? 'bg-indigo-400 dark:bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}\`}></div>
                          <div className="w-3/4 h-2 mb-5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                          <div className="flex gap-3 flex-1">
                            {t.id === 'twocol' && <div className="w-1/3 h-full bg-slate-200 dark:bg-slate-800 rounded-t-md opacity-50"></div>}
                            <div className="flex-1 flex flex-col gap-3">
                              <div className="w-full h-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"></div>
                              <div className="w-full h-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"></div>
                            </div>
                          </div>
                        </div>
                        <h4 className={\`text-[15px] font-bold text-center transition-colors \${template === t.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}\`}>{t.name}</h4>
                        {template === t.id && (
                          <div className="absolute top-4 right-4 bg-indigo-500 text-white rounded-full p-1 shadow-lg shadow-indigo-500/40">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center items-center">
                    <div className="bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2 flex gap-2">
                      <button className="text-[14px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-3 rounded-xl transition-colors" onClick={() => setStep(2)}>Go Back</button>
                      <button className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[14px] font-bold px-8 py-3 rounded-xl transition-all shadow-md" onClick={() => setStep(4)}>Enter Visual Editor</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 4: EDITOR & PREVIEW ══ */}
              {step === 4 && editData && (
                <div className="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* LEFT: EDITOR PANEL */}
                  <div className="w-full lg:w-[450px] flex flex-col h-[calc(100vh-200px)] min-h-[600px] bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-xl overflow-hidden transition-colors duration-300">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
                      <h3 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider"><Sliders className="w-4 h-4 text-indigo-500"/> Content Editor</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-10">
                      {/* Personal Info */}
                      <section>
                        <h4 className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Identity</h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div><label className={LabelCls}>Full Name</label><input className={InputCls} value={editData.name||''} onChange={(e)=>updateField('personalInfo', null, 'name', e.target.value)} /></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className={LabelCls}>Email</label><input className={InputCls} value={editData.email||''} onChange={(e)=>updateField('personalInfo', null, 'email', e.target.value)} /></div>
                            <div><label className={LabelCls}>Phone</label><input className={InputCls} value={editData.phone||''} onChange={(e)=>updateField('personalInfo', null, 'phone', e.target.value)} /></div>
                          </div>
                          <div><label className={LabelCls}>Location</label><input className={InputCls} value={editData.location||''} onChange={(e)=>updateField('personalInfo', null, 'location', e.target.value)} /></div>
                        </div>
                      </section>

                      {/* Summary */}
                      <section>
                        <h4 className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Summary</h4>
                        <textarea className={\`\${InputCls} h-32 resize-y text-[14px] leading-relaxed\`} value={editData.summary||''} onChange={(e)=>setEditData({...editData, summary: e.target.value})} />
                      </section>

                      {/* Dynamic Sections */}
                      {['experience', 'education', 'skills', 'projects'].map(sectionKey => {
                        const items = editData[sectionKey] || [];
                        return (
                          <section key={sectionKey}>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                              <h4 className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">{sectionKey}</h4>
                              <button onClick={() => addItem(sectionKey)} className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full"><Plus className="w-3.5 h-3.5 inline mr-1"/>Add</button>
                            </div>
                            <div className="space-y-4">
                              {items.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 relative group transition-all hover:border-slate-300 dark:hover:border-slate-700">
                                  <button onClick={() => removeItem(sectionKey, idx)} className="absolute -top-2 -right-2 bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><X className="w-3.5 h-3.5"/></button>
                                  <div className="grid grid-cols-1 gap-4">
                                    <input className={\`\${InputCls} py-2.5 text-[14px] font-semibold bg-white dark:bg-[#0f172a]\`} placeholder="Title/Name" value={item.title||item.degree||item.name||item.category||''} onChange={(e)=>updateField(sectionKey, idx, sectionKey==='experience'?'title':sectionKey==='education'?'degree':sectionKey==='projects'?'name':'category', e.target.value)} />
                                    {sectionKey !== 'skills' && <input className={\`\${InputCls} py-2.5 text-[13px] bg-white dark:bg-[#0f172a]\`} placeholder="Organization/Institution" value={item.company||item.school||item.institution||''} onChange={(e)=>updateField(sectionKey, idx, sectionKey==='experience'?'company':sectionKey==='education'?'school':'institution', e.target.value)} />}
                                    <textarea className={\`\${InputCls} py-3 text-[13px] h-24 bg-white dark:bg-[#0f172a]\`} placeholder="Details" value={Array.isArray(item.description) ? item.description.map(d=>\`- \${d}\`).join('\\n') : (item.description||item.items?.join(', ')||'')} onChange={(e)=>updateField(sectionKey, idx, sectionKey==='skills'?'items':'description', e.target.value)} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        )
                      })}
                    </div>
                    
                    <div className="p-5 border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
                      <button className="text-[14px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" onClick={() => setStep(3)}>Layouts</button>
                      <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-[14px] font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20" onClick={() => setStep(5)}>Finalize PDF</button>
                    </div>
                  </div>

                  {/* RIGHT: PREVIEW PANEL */}
                  <div className="flex-1 flex flex-col h-[calc(100vh-200px)] min-h-[600px] bg-slate-200/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-inner relative transition-colors duration-300">
                    <div className="absolute top-5 right-5 z-10 flex items-center gap-2 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-lg">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                      <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">Live Engine</span>
                    </div>
                    
                    <div className="flex-1 p-4 sm:p-10 flex items-center justify-center relative">
                      {pdfBlob ? (
                        <iframe 
                          src={\`\${pdfBlob}#toolbar=0&navpanes=0&scrollbar=0&view=FitH\`} 
                          className="w-full h-full max-h-[100%] max-w-[850px] border border-slate-300 dark:border-slate-700 shadow-2xl rounded-sm bg-white mx-auto" 
                          title="PDF Preview"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50">
                          <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900/50 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
                          <span className="text-[15px] font-bold tracking-wide">Rendering Live Preview...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 5: EXPORT ══ */}
              {step === 5 && editData && (
                <div className="max-w-xl mx-auto mt-12 sm:mt-24 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 p-12 rounded-[2rem] shadow-2xl relative overflow-hidden transition-colors duration-300">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>
                    
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                      <Download className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">Ready to Export</h2>
                    <p className="text-[16px] text-slate-500 dark:text-slate-400 mb-10 leading-relaxed max-w-sm mx-auto">
                      Your resume has been compiled using the <span className="font-bold text-indigo-600 dark:text-indigo-400">{TEMPLATES.find(t=>t.id===template)?.name}</span> architecture.
                    </p>
                    
                    <button className="w-full bg-slate-900 dark:bg-white hover:opacity-90 text-white dark:text-slate-900 text-[16px] font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-slate-900/10 dark:shadow-white/10"
                      onClick={() => downloadPDF(false)} disabled={generating}>
                      {generating ? <><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"/> Processing Document...</> : <><Download className="w-5 h-5"/> Download High-Res PDF</>}
                    </button>
                    
                    <button className="mt-8 text-[14px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" onClick={() => setStep(4)}>
                      Back to Editor
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
`

const fileContent = fs.readFileSync('src/pages/ResumeExport.jsx', 'utf8');

const lines = fileContent.split(/\r?\n/);
let returnIdx = 788;

// I'll dynamically find the correct return statement
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === 'return (' && lines[i].indexOf('  return') === 0) {
    returnIdx = i;
    break; 
  }
}

if (returnIdx === -1) {
  console.error("Could not find return statement");
  process.exit(1);
}

const topHalfLines = lines.slice(0, returnIdx);
const topHalf = topHalfLines.join('\n') + '\n';
fs.writeFileSync('src/pages/ResumeExport.jsx', topHalf + premiumUI, 'utf8');
console.log('Successfully rewrote layout to Glassmorphism Dark Mode standard.');
