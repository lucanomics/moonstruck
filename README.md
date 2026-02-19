# StudyFlow 2026

ADHD 대학생을 위한 클라이언트 사이드 학습 자료 변환 웹 애플리케이션입니다. 
PDF 및 이미지(OCR) 형태의 전공 서적 발췌본을 입력받아, 브라우저 환경에서 텍스트를 청킹(Chunking)한 뒤 X(트위터) 타래 또는 인스타그램 매거진 카드 형식으로 요약 변환합니다.

## Architecture
이 프로젝트는 서버리스(Serverless) 정적 웹 애플리케이션으로 설계되었습니다. 서버 비용 방어를 위해 문서 파싱과 광학 문자 인식(OCR) 연산은 전적으로 클라이언트(브라우저) 자원을 사용합니다.

* **PDF Parsing:** Mozilla `pdf.js`
* **Image OCR:** WebAssembly 기반 `Tesseract.js`
* **LLM API:** OpenAI API (`localStorage`를 통한 클라이언트 직접 통신)

## Directory Structure
