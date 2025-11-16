import jsPDF from 'jspdf';
import type { Story } from './types';

export function exportStoryAsPDF(story: Story): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = 20;

  const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color[0], color[1], color[2]);
    const lines = pdf.splitTextToSize(text, maxWidth);

    if (yPosition + (lines.length * fontSize * 0.35) > pdf.internal.pageSize.getHeight() - 20) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * fontSize * 0.35 + 5;
  };

  const addSection = (title: string, content: string | string[], isList: boolean = false) => {
    yPosition += 5;
    addText(title, 14, true, [71, 85, 105]);
    yPosition += 2;

    if (isList && Array.isArray(content)) {
      content.forEach((item) => {
        addText(`• ${item}`, 11, false);
      });
    } else if (typeof content === 'string') {
      addText(content, 11, false);
    }
  };

  addText(`Team Story: ${story.team_name}`, 18, true, [30, 41, 59]);
  yPosition += 5;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated: ${new Date(story.generated_at).toLocaleDateString()}`, margin, yPosition);
  yPosition += 10;

  if (story.enps_score !== null) {
    const scoreColor: [number, number, number] =
      story.enps_score >= 50 ? [34, 197, 94] :
      story.enps_score >= 0 ? [234, 179, 8] :
      [239, 68, 68];

    addText(`eNPS Score: ${story.enps_score.toFixed(0)}`, 16, true, scoreColor);
    yPosition += 3;
  }

  if (story.sentiment) {
    const sentimentText = story.sentiment.charAt(0).toUpperCase() + story.sentiment.slice(1);
    addText(`Sentiment: ${sentimentText}`, 12, false, [100, 100, 100]);
    yPosition += 5;
  }

  if (story.promoters_pct !== null && story.passives_pct !== null && story.detractors_pct !== null) {
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, yPosition, maxWidth, 30, 'FD');

    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Team Distribution', margin + 5, yPosition);
    yPosition += 8;

    const colWidth = maxWidth / 3;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');

    pdf.setTextColor(34, 197, 94);
    pdf.text(`${story.promoters_pct.toFixed(1)}%`, margin + colWidth * 0.5, yPosition, { align: 'center' });
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Promoters', margin + colWidth * 0.5, yPosition + 5, { align: 'center' });

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(234, 179, 8);
    pdf.text(`${story.passives_pct.toFixed(1)}%`, margin + colWidth * 1.5, yPosition, { align: 'center' });
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Passives', margin + colWidth * 1.5, yPosition + 5, { align: 'center' });

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(239, 68, 68);
    pdf.text(`${story.detractors_pct.toFixed(1)}%`, margin + colWidth * 2.5, yPosition, { align: 'center' });
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Detractors', margin + colWidth * 2.5, yPosition + 5, { align: 'center' });

    yPosition += 15;
  }

  if (story.narrative) {
    addSection('Summary', story.narrative);
  }

  if (story.key_themes && story.key_themes.length > 0) {
    addSection('Key Themes', story.key_themes, true);
  }

  if (story.strengths && story.strengths.length > 0) {
    addSection('Strengths', story.strengths, true);
  }

  if (story.concerns && story.concerns.length > 0) {
    addSection('Areas of Concern', story.concerns, true);
  }

  if (story.quotes && story.quotes.length > 0) {
    yPosition += 5;
    addText('Sample Quotes', 14, true, [71, 85, 105]);
    yPosition += 2;

    story.quotes.forEach((quote) => {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      const quoteLines = pdf.splitTextToSize(`"${quote}"`, maxWidth - 10);

      if (yPosition + (quoteLines.length * 11 * 0.35) > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.text(quoteLines, margin + 5, yPosition);
      yPosition += quoteLines.length * 11 * 0.35 + 8;
    });
  }

  const fileName = `${story.team_name.replace(/\s+/g, '-')}-story.pdf`;
  pdf.save(fileName);
}
