const fs = require('fs');

const premiumUI = `  return (
    <Layout>
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0B0D10] font-sans transition-colors duration-300 flex flex-col">
        
        {/* PREMIUM ENTERPRISE TOP NAVBAR */}
        <div className="bg-white dark:bg-[#111318] border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-sm">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-[16px] font-semibold text-slate-900 dark:text-white leading-tight">Resume Studio</h1>
              <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Multi-page PDF Engine</p>
            </div>
          </div>
          
          {/* Minimalist Segmented Stepper */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50 overflow-x-auto w-full md:w-auto">
            {STEPS.map((s, i) => {
              const active = step === s.num;
              const done = step > s.num;
              return (
                <div key={s.num} onClick={() => done && setStep(s.num)}
                  className={\`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap \${done ? 'cursor-pointer' : 'cursor-default'} \${
                    active 
                      ? 'bg-white dark:bg-[#1A1D24] text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700/50' 
                      : done
                        ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                        : 'text-slate-400 dark:text-slate-600'
                  }\`}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <s.icon className="w-3.5 h-3.5" />}
                  {s.label}
                </div>
              )
            })}
          </div>
        </div>

        {/* MAIN WORKSPACE AREA */}
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-3">
              <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
              <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Loading workspace...</span>
            </div>
          ) : (
            <div className="flex-1 w-full">
              
              {/* ══ STEP 1: SELECT ══ */}
              {step === 1 && (
                <div className="max-w-2xl mx-auto mt-4 sm:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mb-1">Select Source Document</h2>
                    <p className="text-[14px] text-slate-500 dark:text-slate-400">Choose a base resume profile to format and export.</p>
                  </div>
                  
                  <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
                    {resumes.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center">
                        <AlertOctagon className="w-8 h-8 text-rose-500 mb-3" />
                        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white mb-1">No profiles found</h3>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">You need to create a resume before exporting.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {resumes.map(r => (
                          <div key={r.id} onClick={() => setSelectedId(r.id)}
                            className={\`p-5 flex items-center justify-between cursor-pointer transition-colors \${
                              selectedId === r.id 
                                ? 'bg-slate-50 dark:bg-slate-800/40' 
                                : 'hover:bg-slate-50/50 dark:hover:bg-[#1A1D24]/50'
                            }\`}>
                            <div className="flex items-center gap-4">
                              <div className={\`w-10 h-10 rounded-xl flex items-center justify-center transition-colors \${
                                selectedId === r.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                              }\`}><FileText className="w-4 h-4" /></div>
                              <div>
                                <h4 className="text-[14px] font-semibold text-slate-900 dark:text-white">{r.title}</h4>
                                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{r.fileType?.toUpperCase()} · {new Date(r.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className={\`w-5 h-5 rounded-full border flex items-center justify-center transition-colors \${
                              selectedId === r.id ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white' : 'border-slate-300 dark:border-slate-700'
                            }\`}>
                              {selectedId === r.id && <CheckCircle2 className="w-3.5 h-3.5 text-white dark:text-slate-900" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0B0D10]">
                      <button 
                        className="w-full bg-slate-900 dark:bg-white hover:opacity-90 text-white dark:text-slate-900 text-[14px] font-semibold py-3 rounded-xl transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        onClick={parseAndAnalyze} disabled={parsing || !selectedId}>
                        {parsing ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/> Processing...</> : <><Wand2 className="w-4 h-4" /> Optimize Document</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 2: AI OPTIMIZATION ══ */}
              {step === 2 && editData && (
                <div className="max-w-4xl mx-auto mt-4 sm:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-6 flex items-end justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mb-1">Document Analysis</h2>
                      <p className="text-[14px] text-slate-500 dark:text-slate-400">Review detected structural issues before formatting.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-6">
                      <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                          {editData.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <h4 className="text-[15px] font-semibold text-slate-900 dark:text-white truncate">{editData.name || 'Unknown'}</h4>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate mb-6">{editData.email || 'No email'}</p>
                        
                        <div className="space-y-2">
                          {[
                            { k: 'Summary', v: editData.summary?.length > 20 },
                            { k: \`Education (\${editData.education?.filter(e=>e.institution).length || 0})\`, v: editData.education?.some(e=>e.institution) },
                            { k: \`Experience (\${editData.experience?.length || 0})\`, v: editData.experience?.length > 0 },
                            { k: \`Projects (\${editData.projects?.length || 0})\`, v: editData.projects?.length > 0 },
                            { k: 'Skills', v: Object.values(editData.skills || {}).some(v=>v) },
                          ].map(s => (
                            <div key={s.k} className="flex items-center justify-between text-[13px] font-medium">
                              <span className="text-slate-600 dark:text-slate-400">{s.k}</span>
                              {s.v ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <X className="w-4 h-4 text-rose-500"/>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col h-full min-h-[400px]">
                        <div className="border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 bg-slate-50/50 dark:bg-[#0B0D10]/50 rounded-t-2xl">
                          <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Improvement Suggestions
                          </h3>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                          {suggestions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
                              <h4 className="text-[15px] font-semibold text-slate-900 dark:text-white mb-1">Excellent Structure</h4>
                              <p className="text-[13px] text-slate-500 dark:text-slate-400">No critical formatting issues found.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {suggestions.map((s, i) => {
                                const done = appliedIdx.includes(i);
                                return (
                                  <div key={i} className={\`p-4 rounded-xl border transition-colors \${done ? 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-700 shadow-sm'}\`}>
                                    <div className="flex items-start gap-3">
                                      <div className={\`mt-0.5 shrink-0 \${done ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}\`}>
                                        {done ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                      </div>
                                      <div className="flex-1">
                                        <h5 className={\`text-[14px] font-semibold mb-1 \${done ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-white'}\`}>{s.title}</h5>
                                        {!done && (
                                          <>
                                            <p className="text-[13px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">{s.detail}</p>
                                            <div className="bg-slate-50 dark:bg-[#0B0D10] px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800 text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-3">
                                              <span className="text-slate-400 dark:text-slate-500 font-semibold mr-2">FIX:</span>{s.fix}
                                            </div>
                                            <button onClick={() => applySuggestion(s, i)} disabled={applyingIdx === i}
                                              className="bg-slate-900 dark:bg-white hover:opacity-90 text-white dark:text-slate-900 text-[12px] font-semibold px-4 py-2 rounded-lg transition-opacity flex items-center gap-2">
                                              {applyingIdx === i ? <><div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"/> Applying...</> : 'Apply Fix'}
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
                        <div className="p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0B0D10]/50 rounded-b-2xl flex justify-between items-center">
                           <button className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => setStep(1)}>Back</button>
                           <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[13px] font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm" onClick={() => setStep(3)}>Continue to Layouts</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 3: TEMPLATES ══ */}
              {step === 3 && (
                <div className="max-w-5xl mx-auto mt-4 sm:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8 text-center sm:text-left">
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mb-1">Architecture Layout</h2>
                    <p className="text-[14px] text-slate-500 dark:text-slate-400">Select a structural foundation. You can switch layouts non-destructively later.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    {TEMPLATES.map(t => (
                      <div key={t.id} onClick={() => setTemplate(t.id)}
                        className={\`bg-white dark:bg-[#111318] p-4 rounded-2xl cursor-pointer transition-all border group relative \${
                          template === t.id 
                            ? 'border-slate-900 dark:border-white ring-1 ring-slate-900 dark:ring-white shadow-md' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                        }\`}>
                        <div className="aspect-[1/1.414] w-full bg-slate-50 dark:bg-[#0B0D10] rounded-xl mb-4 relative overflow-hidden flex flex-col pt-3 px-3 border border-slate-100 dark:border-slate-800/80 transition-colors">
                          <div className={\`w-full h-1.5 mb-2 rounded-sm \${t.id === 'modern' ? 'bg-slate-300 dark:bg-slate-600' : 'bg-slate-200 dark:bg-slate-800'}\`}></div>
                          <div className="w-3/4 h-1.5 mb-4 rounded-sm bg-slate-200 dark:bg-slate-800"></div>
                          <div className="flex gap-2 flex-1">
                            {t.id === 'twocol' && <div className="w-1/3 h-full bg-slate-200 dark:bg-slate-800 rounded-t-sm"></div>}
                            <div className="flex-1 flex flex-col gap-2">
                              <div className="w-full h-10 bg-white dark:bg-[#1A1D24] rounded-sm border border-slate-200 dark:border-slate-700"></div>
                              <div className="w-full h-10 bg-white dark:bg-[#1A1D24] rounded-sm border border-slate-200 dark:border-slate-700"></div>
                            </div>
                          </div>
                        </div>
                        <h4 className="text-[13px] font-semibold text-slate-900 dark:text-white text-center">{t.name}</h4>
                        {template === t.id && (
                          <div className="absolute top-2 right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full p-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800/80">
                    <button className="text-[14px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => setStep(2)}>Back</button>
                    <button className="bg-slate-900 dark:bg-white hover:opacity-90 text-white dark:text-slate-900 text-[14px] font-semibold px-8 py-3 rounded-xl transition-opacity shadow-sm" onClick={() => setStep(4)}>Enter Workspace</button>
                  </div>
                </div>
              )}

              {/* ══ STEP 4: EDITOR & PREVIEW ══ */}
              {step === 4 && editData && (
                <div className="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 -mt-2">
                  
                  {/* LEFT: EDITOR PANEL */}
                  <div className="w-full lg:w-5/12 flex flex-col h-[calc(100vh-120px)] min-h-[600px] bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-[#0B0D10]/50 shrink-0">
                      <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide"><Sliders className="w-3.5 h-3.5"/> Data Editor</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-8">
                      {/* Personal Info */}
                      <section>
                        <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Identity</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div><label className={LabelCls}>Name</label><input className={InputCls} value={editData.name||''} onChange={(e)=>updateField('personalInfo', null, 'name', e.target.value)} /></div>
                          <div><label className={LabelCls}>Email</label><input className={InputCls} value={editData.email||''} onChange={(e)=>updateField('personalInfo', null, 'email', e.target.value)} /></div>
                          <div><label className={LabelCls}>Phone</label><input className={InputCls} value={editData.phone||''} onChange={(e)=>updateField('personalInfo', null, 'phone', e.target.value)} /></div>
                          <div><label className={LabelCls}>Location</label><input className={InputCls} value={editData.location||''} onChange={(e)=>updateField('personalInfo', null, 'location', e.target.value)} /></div>
                        </div>
                      </section>

                      {/* Summary */}
                      <section>
                        <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Summary</h4>
                        <textarea className={\`\${InputCls} h-28 resize-y text-[13px] leading-relaxed\`} value={editData.summary||''} onChange={(e)=>setEditData({...editData, summary: e.target.value})} />
                      </section>

                      {/* Dynamic Sections */}
                      {['experience', 'education', 'skills', 'projects'].map(sectionKey => {
                        const items = editData[sectionKey] || [];
                        return (
                          <section key={sectionKey}>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                              <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{sectionKey}</h4>
                              <button onClick={() => addItem(sectionKey)} className="text-[11px] font-semibold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Plus className="w-3.5 h-3.5 inline"/> Add</button>
                            </div>
                            <div className="space-y-4">
                              {items.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 relative group">
                                  <button onClick={() => removeItem(sectionKey, idx)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition-colors"><X className="w-3.5 h-3.5"/></button>
                                  <div className="grid grid-cols-1 gap-3 pr-6">
                                    <input className={\`\${InputCls} py-2 text-[13px]\`} placeholder="Title/Name" value={item.title||item.degree||item.name||item.category||''} onChange={(e)=>updateField(sectionKey, idx, sectionKey==='experience'?'title':sectionKey==='education'?'degree':sectionKey==='projects'?'name':'category', e.target.value)} />
                                    {sectionKey !== 'skills' && <input className={\`\${InputCls} py-2 text-[13px]\`} placeholder="Organization/Institution" value={item.company||item.school||item.institution||''} onChange={(e)=>updateField(sectionKey, idx, sectionKey==='experience'?'company':sectionKey==='education'?'school':'institution', e.target.value)} />}
                                    <textarea className={\`\${InputCls} py-2 text-[13px] h-20\`} placeholder="Details" value={Array.isArray(item.description) ? item.description.map(d=>\`- \${d}\`).join('\\n') : (item.description||item.items?.join(', ')||'')} onChange={(e)=>updateField(sectionKey, idx, sectionKey==='skills'?'items':'description', e.target.value)} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        )
                      })}
                    </div>
                    
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111318] flex items-center justify-between shrink-0">
                      <button className="text-[13px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" onClick={() => setStep(3)}>Back</button>
                      <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[13px] font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm" onClick={() => setStep(5)}>Finalize PDF</button>
                    </div>
                  </div>

                  {/* RIGHT: PREVIEW PANEL */}
                  <div className="w-full lg:w-7/12 flex flex-col h-[calc(100vh-120px)] min-h-[600px] bg-slate-200/50 dark:bg-[#0B0D10]/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-inner relative transition-colors duration-300">
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 dark:bg-[#111318]/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Live</span>
                    </div>
                    
                    <div className="flex-1 p-4 sm:p-8 flex items-center justify-center">
                      {pdfBlob ? (
                        <iframe 
                          src={\`\${pdfBlob}#toolbar=0&navpanes=0&scrollbar=0&view=FitH\`} 
                          className="w-full h-full max-h-[100%] border border-slate-200 dark:border-slate-700/50 shadow-2xl rounded-xl bg-white" 
                          title="PDF Preview"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-600">
                          <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-700 border-t-slate-500 dark:border-t-slate-400 rounded-full animate-spin"></div>
                          <span className="text-[13px] font-medium tracking-wide">Rendering Layout...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 5: EXPORT ══ */}
              {step === 5 && editData && (
                <div className="max-w-md mx-auto mt-12 sm:mt-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800/80 p-10 rounded-3xl shadow-sm transition-colors duration-300">
                    <div className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                      <Download className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2">Ready to Export</h2>
                    <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                      Your resume has been compiled using the <span className="font-semibold text-slate-700 dark:text-slate-200">{TEMPLATES.find(t=>t.id===template)?.name}</span> architecture.
                    </p>
                    
                    <button className="w-full bg-slate-900 dark:bg-white hover:opacity-90 text-white dark:text-slate-900 font-semibold py-3.5 rounded-xl transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                      onClick={() => downloadPDF(false)} disabled={generating}>
                      {generating ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/> Exporting...</> : <><Download className="w-4 h-4"/> Download PDF</>}
                    </button>
                    
                    <button className="mt-6 text-[13px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" onClick={() => setStep(4)}>
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
export default ResumeExport;
`

const fileContent = fs.readFileSync('src/pages/ResumeExport.jsx', 'utf8');

const lines = fileContent.split(/\r?\n/);
let returnIdx = 755;

if (returnIdx === -1) {
  console.error("Could not find return statement");
  process.exit(1);
}

const topHalfLines = lines.slice(0, returnIdx);
const topHalf = topHalfLines.join('\n') + '\n';
fs.writeFileSync('src/pages/ResumeExport.jsx', topHalf + premiumUI, 'utf8');
console.log('Successfully rewrote layout to enterprise standard.');
