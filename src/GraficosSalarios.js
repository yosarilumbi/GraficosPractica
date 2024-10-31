import React, { useRef } from 'react';
import { View, Button, Alert, StyleSheet, Dimensions } from 'react-native';
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { BarChart } from "react-native-chart-kit";

export default function GraficoSalarios({ dataSalarios }) {
  const chartRef = useRef(); // Referencia al gráfico
  const screenWidth = Dimensions.get("window").width;

  const generarPDF = async () => {
    try {
      // Capturar el gráfico como imagen
      const uri = await captureRef(chartRef, {
        format: "png",
        quality: 1, // Alta calidad para buena resolución
        width: screenWidth - screenWidth * 0.1, // Ajuste al tamaño del gráfico
        height: 300,
      });

      // Crear el PDF
      const doc = new jsPDF();
      doc.text("Reporte de Salarios", 10, 10);

      // Leer la imagen capturada y agregarla al PDF
      const chartImage = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      doc.addImage(`data:image/png;base64,${chartImage}`, "PNG", 10, 20, 180, 90);

      // Agregar datos de texto al PDF
      dataSalarios.labels.forEach((label, index) => {
        const salario = dataSalarios.datasets[0].data[index];
        doc.text(`${label}: C$${salario}`, 10, 120 + index * 10);
      });

      // Guardar y compartir el PDF
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileUri = `${FileSystem.documentDirectory}reporte_salarios.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error al generar o compartir el PDF: ", error);
      Alert.alert('Error', 'No se pudo generar o compartir el PDF.');
    }
  };

  return (
    <View style={styles.container}>
      <View ref={chartRef} collapsable={false} style={styles.chartContainer}>
        <BarChart
          data={dataSalarios}
          width={screenWidth - screenWidth * 0.1}
          height={300}
          yAxisLabel="C$"
          chartConfig={{
            backgroundGradientFrom: "#00FFFF",
            backgroundGradientFromOpacity: 0.1,
            backgroundGradientTo: "#FFFFFF",
            backgroundGradientToOpacity: 1,
            color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
            strokeWidth: 1,
            barPercentage: 0.5,
          }}
          style={{
            borderRadius: 10,
          }}
          verticalLabelRotation={45}
          withHorizontalLabels={true}
          showValuesOnTopOfBars={true}
        />
      </View>

      <View style={styles.button}>
        <Button title="Generar y Compartir PDF" onPress={generarPDF} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 10,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
  },
});