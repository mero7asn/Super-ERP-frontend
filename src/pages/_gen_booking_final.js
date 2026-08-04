const fs = require('fs');
const out = 'C:\\Users\\Admin\\Desktop\\Core 360\\frontend\\src\\pages\\BookingLookupPage.jsx';
let c = '';
c += "import { useState, useMemo } from 'react';\n";
c += "import { useNavigate } from 'react-router-dom';\n";
c += "import { Icon } from '../components/Icons';\n";
c += "import API from '../services/api';\n";
c += "import { useAuth } from '../context/AuthContext';\n";
c += "\n";
// statusBadge helper (unchanged)
c += "const statusBadge = (status) => {";
c += "const m={Open:'badge-new','In Progress':'badge-qualified',Resolved:'badge-converted',Closed:'badge-meta',Canceled:'badge-lost',Cancelled:'badge-lost',Paused:'badge-contacted',Completed:'badge-converted',Confirmed:'badge-converted',Pending:'badge-contacted',Refunded:'badge-lost','Awaiting Payment':'badge-contacted',Returned:'badge-qualified'};";
c += "return m[status]||'badge-new';};";
c += "\n";
// paymentBadge helper (unchanged)
c += "const paymentBadge = (status) => {";
c += "const m={Paid:'badge-converted',Pending:'badge-contacted',Failed:'badge-lost',Refunded:'badge-meta','Partially Refunded':'badge-qualified'};";
c += "return m[status]||'badge-new';};";
c += "\n";
// tabConfig with icons
c += "const tabConfig = [";
c += "{key:'Overview',icon:'dashboard',label:'Overview'},";
c += "{key:'Offers',icon:'box',label:'Offers'},";
c += "{key:'Payments',icon:'wallet',label:'Payments'},";
c += "{key:'Communication',icon:'message',label:'Messages'},";
c += "{key:'Documents',icon:'file-text',label:'Documents'},";
c += "{key:'Timeline',icon:'timeline',label:'Timeline'},";
c += "{key:'Audit Log',icon:'analytics',label:'Audit'},";
c += "{key:'Internal Notes',icon:'tag',label:'Notes'}";
c += "];\n";
// statusSteps for progress panel
c += "const statusSteps = [";
c += "{label:'Booking Created',done:true},";
c += "{label:'Offer Sent',done:true},";
c += "{label:'Customer Viewed',done:true},";
c += "{label:'Payment Received',done:true},";
c += "{label:'Confirm Booking',done:false},";
c += "{label:'Ticket Issued',done:false},";
c += "{label:'Completed',done:false}";
c += "];\n";
// formatRelativeTime helper
c += "const fmtRel=(ds)=>{";
c += "if(!ds)return'Just now';";
c += "const n=new Date(),t=new Date(ds),d=n-t;";
c += "const m=Math.floor(d/60000),h=Math.floor(d/3600000),dd=Math.floor(d/86400000);";
c += "if(m<1)return'Just now';";
c += "if(m<60)return m+'m ago';";
c += "if(h<24)return h+'h ago';";
c += "if(dd<7)return dd+'d ago';";
c += "return t.toLocaleDateString();};";
c += "\n";
// KPI config
c += "const kpiData=[ ";
c += "{key:'booking',label:'Booking',accent:'#2563EB'}, ";
c += "{key:'paid',label:'Paid',accent:'#10B981'}, ";
c += "{key:'refund',label:'Refund',accent:'#F59E0B'}, ";
c += "{key:'outstanding',label:'Outstanding',accent:'#EF4444'}, ";
c += "{key:'offers',label:'Offers',accent:'#8B5CF6'}, ";
c += "{key:'activities',label:'Activities',accent:'#6B7280'} ";
c += "];\n";
// BookingLookupPage component
c += "const BookingLookupPage=()=>{";
c += "const{user}=useAuth();const navigate=useNavigate();";
c += "const[recordLocator,setRecordLocator]=useState('');";
c += "const[searchType,setSearchType]=useState('recordLocator');";
c += "const[booking,setBooking]=useState(null);";
c += "const[loading,setLoading]=useState(false);";
c += "const[error,setError]=useState('');";
c += "const[activeTab,setActiveTab]=useState('Overview');";
c += "const[currentRole]=useState(user?.role||'Sales Agent');";
c += "const canAccess=['Sales Agent','Sales Manager','Customer Support Agent','Customer Support Manager','CRM Developer','CRM Consultant','System Architect','Super CRM Administrator'].includes(currentRole);";
c += "const canRefund=['Finance Manager','Finance Analyst','Super CRM Administrator','CRM Developer','CRM Consultant','System Architect'].includes(currentRole);";
c += "const canCancel=['Sales Manager','Customer Support Manager','Super CRM Administrator','CRM Developer','CRM Consultant','System Architect'].includes(currentRole);";
c += "const canDelete=['Super CRM Administrator','CRM Developer','System Architect'].includes(currentRole);";
// handleLookup
c += "const handleLookup=async(e)=>{e.preventDefault();if(!recordLocator)return;setLoading(true);setError('');setBooking(null);";
c += "try{const res=await API.get('/offers/locator/'+recordLocator);setBooking(res.data.data);}";
c += "catch(err){setError(err.response?.data?.message||'Booking not found');}finally{setLoading(false);}};";
// handleStatusChange
c += "const handleStatusChange=async(status)=>{if(!booking||!confirm('Change booking status to '+status+'?'))return;";
c += "try{await API.put('/offers/'+booking._id,{status});setBooking((p)=>({...p,status}));}catch{setError('Failed to update booking status');}};";
// quickAction
c += "const quickAction=(label)=>{";
c += "if(label==='Refund'&&!canRefund){setError('Only finance roles can process refunds.');return;}";
c += "if(label==='Cancel Booking'&&!canCancel){setError('Only managers or admins can cancel completed bookings.');return;}";
c += "if(label==='Delete Booking'&&!canDelete){setError('Only administrators can permanently delete a booking.');return;}";
c += "setError(label+' action is ready for implementation.');};";
// Extract data
c += "const bookingId=booking?.recordLocator||booking?.bookingRef||booking?._id||'—';";
c += "const bookingAmount=Number(booking?.price||booking?.amount||0);";
c += "const currency=booking?.currency||'USD';";
c += "const paymentStatus=booking?.paymentStatus||'Pending';";
c += "const customerName=booking?.lead?.name||'Customer name not listed';";
c += "const customerEmail=booking?.lead?.email||'Email not listed';";
c += "const customerPhone=booking?.lead?.phone||'Phone not listed';";
c += "const bookingStatus=booking?.status||'Pending';";
c += "const customerType=booking?.lead?.type||(Math.random()>0.5?'Returning':'New');";
c += "const customerAvatar=booking?.lead?.avatar||customerName?.charAt(0)||'?';";
c += "const customerRating=booking?.lead?.rating||(customerType==='Returning'?5:4);";
c += "const offers=Array.isArray(booking?.offers)&&booking.offers.length>0?booking.offers:[{title:'Primary offer',status:bookingStatus,total:bookingAmount,createdAt:booking?.createdAt,description:booking?.description||'Offer details will appear here once linked to this booking.'}];";
c += "const payments=Array.isArray(booking?.payments)&&booking.payments.length>0?booking.payments:[{id:'PAY-001',amount:bookingAmount,method:'Card',status:paymentStatus,date:booking?.createdAt||new Date().toISOString()}];";
c += "const communications=Array.isArray(booking?.communications)&&booking.communications.length>0?booking.communications:[{type:'Email',detail:'Customer confirmation email prepared',employee:currentRole,date:booking?.createdAt||new Date().toISOString()}];";
c += "const documents=Array.isArray(booking?.documents)&&booking.documents.length>0?booking.documents:[{name:'Booking confirmation.pdf',type:'Invoice',date:booking?.createdAt||new Date().toISOString()}];";
c += "const timeline=Array.isArray(booking?.timeline)&&booking.timeline.length>0?booking.timeline:[";
c += "{title:'Booking created',date:booking?.createdAt||new Date().toISOString(),description:'A new booking was opened and indexed.'},";
c += "{title:'Offer sent',date:booking?.createdAt||new Date().toISOString(),description:'The offer package was prepared for the customer.'}];";
c += "const notes=Array.isArray(booking?.notes)&&booking.notes.length>0?booking.notes:[{title:'Internal follow-up',note:'Customer requested a revision to the booking details.',employee:currentRole,date:booking?.createdAt||new Date().toISOString()}];";
c += "const auditLog=Array.isArray(booking?.auditLog)&&booking.auditLog.length>0?booking.auditLog:[{action:'Booking viewed',employee:currentRole,role:currentRole,timestamp:booking?.createdAt||new Date().toISOString()}];";

fs.writeFileSync(out, c);
console.log('Part 1 written:', c.length, 'chars');
