
[Moonstruck.md](https://github.com/user-attachments/files/24261881/Moonstruck.md)
# **🌙 Moonstruck\! (AI Study Material Generator)**

**"Rise and Shine\! ✨"** \> **Client-side AI PDF Parsing & Study Table Generator**

## **🚀 Introduction (소개)**

Moonstruck은 단순한 학습 자료 생성기가 아닙니다.  
PDF 파일이나 텍스트를 입력하면, Google Gemini AI가 내용을 분석하여 3가지 고유한 페르소나(Persona)에 맞춰 학습용 엑셀 표를 생성해 주는 AI EdTech 웹 애플리케이션입니다.  
별도의 백엔드 서버 없이 \*\*브라우저 환경(Client-side)\*\*에서 PDF 파싱과 AI 통신을 모두 처리하도록 설계된 Serverless 프로토타입입니다.

## **✨ Key Features (핵심 기능)**

* **⚡️ 3-Mode Persona System:**  
  * **👑 Queen Gabee:** 매운맛 입담으로 정신 교육을 시키며 학습 의지를 고취 (Konglish, Roast).  
  * **🤓 Nerd Genius:** 복잡한 개념을 기발한 비유(Analogy)와 치트시트로 설명.  
  * **🛡️ Drill Sergeant (FM):** 정석적인 시험 대비용 오답 노트 생성.  
* **📂 Client-side PDF Parsing:**  
  * pdf.js (CDN Injection) 기술을 활용하여 서버 업로드 없이 브라우저에서 즉시 PDF 텍스트 추출.  
  * 한국어(CJK) 폰트 깨짐 방지를 위한 CMaps 적용 완료.  
* **🖱️ Drag & Drop Interface:**  
  * 직관적인 파일 업로드 UX 및 반응형 디자인.  
* **💾 Multi-Format Export:**  
  * 생성된 학습 자료를 CSV (Excel), PDF, Word, Markdown 등 다양한 포맷으로 즉시 다운로드.  
* **🔓 Demo Mode:**  
  * API Key가 없는 사용자를 위한 가상 데이터 시뮬레이션 모드 지원.

## **🛠 Tech Stack (기술 스택)**

* **Frontend:** React (Vite), Tailwind CSS  
* **AI Engine:** Google Gemini API (gemini-2.5-flash)  
* **Library:** pdfjs-dist (via CDN), lucide-react  
* **Deployment:** CodeSandbox / Vercel

## **📸 How to Use (사용법)**

1. [**Live Demo**](https://www.google.com/url?sa=E&source=gmail&q=https://g8f25d.csb.app/) 링크에 접속합니다.  
2. **API Key**를 입력합니다. (키가 없다면 비워두세요. 자동으로 **Demo Mode**가 실행됩니다.)  
3. 학습할 **PDF 파일**을 드래그하거나 텍스트를 붙여넣습니다.  
4. 원하는 \*\*모드(Queen / Nerd / FM)\*\*를 선택하고 버튼을 클릭합니다.  
5. **"Moonstruck\!"** 결과물을 확인하고 엑셀로 다운로드합니다.

### **👩‍💻 Developer**

Developed by **Student Manager** (Your Name)

*Dreaming of changing education with AI.*
