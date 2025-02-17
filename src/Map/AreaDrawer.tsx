import {
  Button,
  ColorPicker,
  Divider,
  Drawer,
  Form,
  FormProps,
  Input,
  Popconfirm,
} from "antd";
import { useEffect, useState } from "react";
import { AreaData } from ".";
import { AggregationColor } from "antd/es/color-picker/color";

type AreaDrawerProps = {
  area: string | null;
  onClose: () => void;
  onDelete: () => void;
};

type FieldType = {
  name?: string;
  color?: AggregationColor;
  remember?: string;
};

function AreaDrawer({ area, onClose, onDelete }: AreaDrawerProps) {
  const [data, setData] = useState<AreaData | null>(null);

  const areas: AreaData[] = JSON.parse(localStorage.getItem("areas") || "[]");

  const onCloseDrawer = () => {
    setData(null);
    onClose();
  };

  useEffect(() => {
    areas.map((item) => {
      if (item.id == area) {
        setData(item);
      }
    });
  }, [area]);

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    let editedAreas = areas.map((item) => {
      if (item.id == area) {
        item.name = values.name ? values.name : "";
        item.color = values.color?.toHexString();
      }
      return item;
    });

    localStorage.setItem("areas", JSON.stringify(editedAreas));
    onCloseDrawer();
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  const deleteArea = () => {
    if (data) {
      let newAreas = areas.filter((item) => item.id !== data.id);
      localStorage.setItem("areas", JSON.stringify(newAreas));
      onCloseDrawer();
      onDelete();
    }
  };

  return (
    <Drawer
      onClose={onCloseDrawer}
      open={data !== null}
      title={data ? data.name : "Nenhuma área selecionada"}
    >
      {data !== null && (
        <Form
          name="basic"
          layout="vertical"
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Nome da área"
            name="name"
            rules={[{ required: false, message: "Insira o nome da área" }]}
            initialValue={data.name}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Cor da área"
            name="color"
            rules={[{ required: false, message: "Insira a cor da área" }]}
            initialValue={data.color ? data.color : "#1677ff"}
          >
            <ColorPicker />
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Salvar
            </Button>
          </Form.Item>

          <Divider orientation="center"></Divider>
          <Popconfirm
            title="Apagar área"
            description="Tem certeza que deseja apagar essa área?"
            onConfirm={deleteArea}
            onCancel={() => {}}
            okText="Sim"
            cancelText="Não"
            placement="bottom"
          >
            <Button danger style={{ width: "100%" }}>
              Apagar área
            </Button>
          </Popconfirm>
        </Form>
      )}
    </Drawer>
  );
}

export default AreaDrawer;
